-- Create QQCatalyst tokens table for managing access tokens
CREATE TABLE IF NOT EXISTS qqcatalyst_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token_name VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(50) DEFAULT 'bearer',
    expires_in INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    username VARCHAR(255),
    password VARCHAR(255),
    grant_type VARCHAR(50) DEFAULT 'password_credentials',
    scope TEXT,
    access_token_url VARCHAR(500) DEFAULT 'https://login.qqcatalyst.com/oauth/token',
    client_authentication VARCHAR(50) DEFAULT 'header',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_tokens_active ON qqcatalyst_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_tokens_expires_at ON qqcatalyst_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_tokens_created_by ON qqcatalyst_tokens(created_by);

-- Enable RLS

-- Create RLS policies




-- Insert sample token (based on provided data)
INSERT INTO qqcatalyst_tokens (
    token_name,
    access_token,
    refresh_token,
    token_type,
    expires_in,
    expires_at,
    client_id,
    client_secret,
    username,
    password,
    grant_type,
    scope,
    access_token_url,
    client_authentication,
    metadata
) VALUES (
    'QQCatalystToken',
    'AAEAAJYiBxLVWK_c_bNoAz9KwVEQFUXotwGlCZ_Xv4CnhRbwn53a5GivU7uf9vTvjVcGQvQDGLFDQGsAcBBLVYe5-A-KeM-x2EpNi6WABjkSicyJJv8ZVUswioUEo74KWZOjlQFnwR8EZL5JyrcNjsCfbAvRN-86IFxDD-VssFmj1dhSzlyEChroLWFbdS_0orx96VkcAXhpMGcRd5atX7d1S0B9KTndqAbWNz4rd4XEJoJVR5M9Yk0oe1gofuSZxVQ4UCmDbD4i8CXAWOBXfGTTqu104qvaYafmCHhhB3WcpdKt5bkZjsBofKGjvcJWBRcQKUXma64aliZ-R5UME0NPBFDUAwAAAAEAABAkEEPZOWe-t2kU8iws8tfDpO7NUvIhpla4NAX_phn6518KoLwKQl0rqVwF1zG-2-VF8XBMvb_Y9sTpHuynZlj36C6xEvEcda75NQAcGIkqtfYQ9LH3krJQTIzI5ulP-Qq9Cu-JC3jbXoYLu37RFKIgWyBD3XZFN5RjDJ5epBMupPHFQ2xRzjF1yOM6e5Xjr6EOFg1xkxUOF3uIKdLjlXv6tVlbE8P-AnCR7j9yrcC6wW1UXzwgl40D-81Oye7LPPSgt7Znc28FAZWxa_T2npc1OhHSg8Sr_4lfWLE1hP57ba6LjmfVRUGQ2rvPV9goTElEWXjxrfD_3x4mCfJYxSzY5T3ap2zVJ5lRNyKmKMzPn1bFYCktNO4biynE8sMN5ieZaqO4H0eRKlGlapsYnTYBWwKw9viEZiXRnlmYAZ0xESFzEYSXRIokghrGGgmlC5uxu4HVsoIA7bxfrlLs7S25QSk-nWgekAk0VdAjR8i94HdSr_ozsFqyjM1BkFwUC0fWNQOf62eaw3RmoKqMX7smAmwxj1dxID3H4CC6HLcedG1TRxCI2HozTn4zxyjhmtvhHwHQpTQOpYojmk9-GPyPygszzK58Q8ihCTIsiUOgZb-HcTaQpn7NlkHCplyXSuSEQAzJasoox6jXMVTvrVM73kYMocOXo9EELl43T4ulKjfNnZvHcxHOmxDsBSAazmJZj2OEHIDEzpSWJADp3ccdWqspH1Sism8tOTJzKjI16RGACOko0DFSz0wkWcVGesssKWXvyEVH3nF-ST79NWQwEMu_vHFnb-bqAkuEA-lZoSf4SHRtiuzGmpu2fYmUtgQIFdTFy5KAgkxO8Q0GBGBXEBCkO9vjAVfbfyb9S9MrDDLMpay8M8fAG3GPizAfxGbl4kB9pPa29LvJKh2DV-tMazyo9azbkoG8i4TK1dU3ybUr3X_QTxZpNQKlEAfJ-MoJFjzczI-cEnqQuEo0xwZ9oD5HSgATuvkn4f0NuUj4JzKAbgUufG9EYBwL5_9wUxyBrhtbKduPcI7z4rwdvlZPtMPWnxvaHOWxECqpYssPYrG2Zc-DtZiAwDEGt2cbFmeHBSNjUfkLKj18dbVUKBebcAFDTmf41IFc3G43gfK0Ta4yiqxl9Bf8DDyRZdCVAQaMw7UF5YPZWnjufm9cDe_umJFDilPwMdTElIN9QWcbbU4abP09Ube5hom-j_MpFY8y4PguCGgeAjcOegtVyLrg5Pfzn5npvtnEOGEVvI_3cr_qJL5YfnQqj4GyoqionznXQQvbomeu5dXbFG0X7MA',
    'KbOt!IAAAAI32GOA27IAnelYzO5seki3a1RecHTZQj2mnsNiNCv6rsQAAAAGM8sZYszRVXsvdTqHRY7RiTq6L2gU_4r34_P4O8qUhwfecW1cciv7dUz_OjXEfs5fjHxH308qJmsrolBCUK7584aGjCtXDXaRw8c5xJWPVhoUj8FfmIRIU0NC6xslU-34p_EW6FHPiRk0c4M8fofSln8LBz_8fxACjGMYkNbTAGNgcORyWuO58NZAoc8GieplGh0NRINvz8T8GrENtrJH3TfWK9zTyrnO-HHLl5D8sBg',
    'bearer',
    604800,
    NOW() + INTERVAL '604800 seconds',
    '44c42186-c1b7-49ae-afd4-73d77527acc1',
    'f3f28807-ed94-409c-9e99-6e69cbec5e3e',
    'wael@casurance.com',
    'Think0202!!!',
    'password_credentials',
    'read write',
    'https://login.qqcatalyst.com/oauth/token',
    'header',
    '{"timestamp": 1749249964883}'::jsonb
) ON CONFLICT DO NOTHING;
