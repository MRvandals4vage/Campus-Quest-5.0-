-- ==============================================================================
-- CAMPUS QUEST 5.0 - UNIFIED DATABASE SCHEMA & ATOMIC REGISTRATION FUNCTION
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_name TEXT NOT NULL UNIQUE,
    member_count INTEGER NOT NULL CHECK (member_count >= 2 AND member_count <= 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    ra_number TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    personal_email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_ra_number ON public.team_members(ra_number);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
CREATE INDEX IF NOT EXISTS idx_teams_team_name ON public.teams(team_name);

-- 4. Atomic Registration Stored Procedure (RPC)
-- Executes team creation and all member insertions within a single database transaction.
-- Automatically rolls back all changes if any insertion or unique constraint fails.
CREATE OR REPLACE FUNCTION register_team_with_members(
    p_team_name TEXT,
    p_members JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_team_id UUID;
    v_member JSONB;
    v_member_count INTEGER;
BEGIN
    v_member_count := jsonb_array_length(p_members);
    
    IF v_member_count < 2 OR v_member_count > 4 THEN
        RAISE EXCEPTION 'Team size must be between 2 and 4 members.';
    END IF;

    -- Check duplicate team name (case-insensitive)
    IF EXISTS (SELECT 1 FROM public.teams WHERE LOWER(team_name) = LOWER(TRIM(p_team_name))) THEN
        RAISE EXCEPTION 'Team name already taken! Choose a different name.';
    END IF;

    -- Insert Team
    INSERT INTO public.teams (team_name, member_count)
    VALUES (TRIM(p_team_name), v_member_count)
    RETURNING id INTO v_team_id;

    -- Insert Members
    FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
    LOOP
        -- Check unique constraint for RA number
        IF EXISTS (SELECT 1 FROM public.team_members WHERE LOWER(ra_number) = LOWER(TRIM(v_member->>'raNumber'))) THEN
            RAISE EXCEPTION 'RA Number % is already registered!', UPPER(TRIM(v_member->>'raNumber'));
        END IF;

        -- Check unique constraint for Email
        IF EXISTS (SELECT 1 FROM public.team_members WHERE LOWER(email) = LOWER(TRIM(v_member->>'email'))) THEN
            RAISE EXCEPTION 'Email % is already registered!', LOWER(TRIM(v_member->>'email'));
        END IF;

        INSERT INTO public.team_members (
            team_id,
            team_name,
            full_name,
            ra_number,
            department,
            email,
            personal_email,
            phone
        ) VALUES (
            v_team_id,
            TRIM(p_team_name),
            TRIM(v_member->>'fullName'),
            UPPER(TRIM(v_member->>'raNumber')),
            TRIM(v_member->>'department'),
            LOWER(TRIM(v_member->>'email')),
            LOWER(TRIM(v_member->>'personalEmail')),
            TRIM(v_member->>'phone')
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'team_id', v_team_id,
        'team_name', p_team_name,
        'member_count', v_member_count
    );
END;
$$;
