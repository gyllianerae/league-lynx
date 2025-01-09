-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own platform connections" ON platform_users;
DROP POLICY IF EXISTS "Users can update their own platform connections" ON platform_users;
DROP POLICY IF EXISTS "Users can view their own platform connections" ON platform_users;

-- Enable RLS
ALTER TABLE platform_users ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can insert their own platform connections"
ON platform_users FOR INSERT
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own platform connections"
ON platform_users FOR UPDATE
USING (auth.uid() = profile_id);

CREATE POLICY "Users can view their own platform connections"
ON platform_users FOR SELECT
USING (auth.uid() = profile_id);

-- Add policy for platform users to view other users in their leagues
CREATE POLICY "Users can view platform users in their leagues"
ON platform_users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM leagues l
    JOIN league_members lm ON l.id = lm.league_id
    WHERE l.platform_user_id = platform_users.id
    AND lm.platform_user_id IN (
      SELECT id FROM platform_users WHERE profile_id = auth.uid()
    )
  )
);