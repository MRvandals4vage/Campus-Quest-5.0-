import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";

interface MemberInput {
  fullName?: string;
  raNumber?: string;
  department?: string;
  email?: string;
  personalEmail?: string;
  phone?: string;
}

interface RegisterRequestBody {
  teamName?: string;
  members?: MemberInput[];
}

export async function POST(request: Request) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { teamName, members } = body;

    // 1. Server-side Validation
    if (!teamName || typeof teamName !== "string" || !teamName.trim()) {
      return NextResponse.json(
        { error: "Team Name is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(members) || members.length < 2 || members.length > 4) {
      return NextResponse.json(
        { error: "Team must consist of 2 to 4 members." },
        { status: 400 }
      );
    }

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.fullName?.trim()) {
        return NextResponse.json(
          { error: `Member ${i + 1} Full Name is required.` },
          { status: 400 }
        );
      }
      if (!m.raNumber?.trim()) {
        return NextResponse.json(
          { error: `Member ${i + 1} RA Number is required.` },
          { status: 400 }
        );
      }
      if (!m.department?.trim()) {
        return NextResponse.json(
          { error: `Member ${i + 1} Department is required.` },
          { status: 400 }
        );
      }
      if (!m.email?.trim() || !m.email.toLowerCase().endsWith("@srmist.edu.in")) {
        return NextResponse.json(
          { error: `Member ${i + 1} SRM Email must end with @srmist.edu.in` },
          { status: 400 }
        );
      }
      if (!m.personalEmail?.trim()) {
        return NextResponse.json(
          { error: `Member ${i + 1} Personal Email is required.` },
          { status: 400 }
        );
      }
      if (!m.phone?.trim() || !/^\d{10}$/.test(m.phone.trim())) {
        return NextResponse.json(
          { error: `Member ${i + 1} Phone must be a valid 10-digit number.` },
          { status: 400 }
        );
      }
    }

    // Check intra-submission duplicates
    const raSet = new Set<string>();
    const emailSet = new Set<string>();
    for (const m of members) {
      const ra = m.raNumber!.trim().toUpperCase();
      const email = m.email!.trim().toLowerCase();
      if (raSet.has(ra)) {
        return NextResponse.json(
          { error: `Duplicate RA Number (${ra}) within submitted members.` },
          { status: 400 }
        );
      }
      if (emailSet.has(email)) {
        return NextResponse.json(
          { error: `Duplicate Email (${email}) within submitted members.` },
          { status: 400 }
        );
      }
      raSet.add(ra);
      emailSet.add(email);
    }

    const supabase = getSupabase();

    // 2. Try Single Atomic Database Procedure (RPC)
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "register_team_with_members",
      {
        p_team_name: teamName.trim(),
        p_members: members.map((m) => ({
          fullName: m.fullName!.trim(),
          raNumber: m.raNumber!.trim().toUpperCase(),
          department: m.department!.trim(),
          email: m.email!.trim().toLowerCase(),
          personalEmail: m.personalEmail!.trim().toLowerCase(),
          phone: m.phone!.trim(),
        })),
      }
    );

    if (!rpcError && rpcData) {
      return NextResponse.json({
        success: true,
        data: rpcData,
        message: "Registration completed successfully!",
      });
    }

    if (rpcError) {
      console.warn("Supabase RPC register_team_with_members error/fallback:", rpcError);
      // If it's explicitly a unique constraint / duplicate error raised by RPC check, return standard user message
      if (rpcError.message.includes("already registered") || rpcError.message.includes("already taken")) {
        return NextResponse.json({ error: rpcError.message }, { status: 400 });
      }
    }

    // 3. Fallback: Direct Table Insertion

    const teamId = crypto.randomUUID();
    const cleanTeamName = teamName.trim();

    const { error: teamError } = await supabase.from("teams").insert({
      id: teamId,
      team_name: cleanTeamName,
      member_count: members.length,
    });

    if (teamError) {
      const isDuplicate = teamError.message.includes("duplicate") || teamError.message.includes("unique");
      return NextResponse.json(
        { error: isDuplicate ? "Team name already taken! Choose a different name." : teamError.message },
        { status: 400 }
      );
    }

    const memberRows = members.map((m) => ({
      team_id: teamId,
      team_name: cleanTeamName,
      full_name: m.fullName!.trim(),
      ra_number: m.raNumber!.trim().toUpperCase(),
      department: m.department!.trim(),
      email: m.email!.trim().toLowerCase(),
      personal_email: m.personalEmail!.trim().toLowerCase(),
      phone: m.phone!.trim(),
    }));

    const { error: membersError } = await supabase.from("team_members").insert(memberRows);

    if (membersError) {
      await supabase.from("teams").delete().eq("id", teamId);
      const isDuplicate = membersError.message.includes("duplicate") || membersError.message.includes("unique");
      return NextResponse.json(
        { error: isDuplicate ? "One or more RA Numbers or emails are already registered!" : membersError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      teamId,
      teamName: cleanTeamName,
      memberCount: members.length,
      message: "Registration completed successfully!",
    });
  } catch (err) {
    console.error("Backend registration API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
