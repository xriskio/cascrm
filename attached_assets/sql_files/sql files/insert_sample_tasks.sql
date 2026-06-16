-- Insert sample tasks with various statuses, priorities, and due dates
DO $$
DECLARE
    current_user_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get the first user ID from the system (likely an admin)
    SELECT id INTO current_user_id FROM auth.users LIMIT 1;
    
    -- Use the same ID for admin if needed
    admin_user_id := current_user_id;
    
    -- Task 1: Not Started, High Priority, Due Soon
    INSERT INTO public.tasks (
        title, 
        description, 
        status, 
        priority, 
        due_date, 
        completion_percentage, 
        creator_id, 
        assignee_id, 
        supervisor_id
    ) VALUES (
        'Review ABC Transportation policy renewal',
        'Complete full review of policy details and prepare renewal quote for ABC Transportation',
        'Not Started',
        'High',
        NOW() + INTERVAL '2 days',
        0,
        current_user_id,
        current_user_id,
        current_user_id
    );
    
    -- Task 2: In Progress, Medium Priority, Due in a week
    INSERT INTO public.tasks (
        title, 
        description, 
        status, 
        priority, 
        due_date, 
        completion_percentage, 
        creator_id, 
        assignee_id
    ) VALUES (
        'Update contact information for XYZ Logistics',
        'Verify and update all contact information for XYZ Logistics in the system',
        'In Progress',
        'Medium',
        NOW() + INTERVAL '7 days',
        45,
        current_user_id,
        current_user_id
    );
    
    -- Task 3: Completed, Low Priority, Past Due
    INSERT INTO public.tasks (
        title, 
        description, 
        status, 
        priority, 
        due_date, 
        completion_percentage, 
        creator_id, 
        assignee_id
    ) VALUES (
        'Submit monthly sales report',
        'Compile and submit the monthly sales report to management',
        'Completed',
        'Low',
        NOW() - INTERVAL '2 days',
        100,
        current_user_id,
        current_user_id
    );
    
    -- Task 4: On Hold, Urgent Priority, Due Today
    INSERT INTO public.tasks (
        title, 
        description, 
        status, 
        priority, 
        due_date, 
        completion_percentage, 
        creator_id, 
        assignee_id
    ) VALUES (
        'Follow up on Smith Trucking claim',
        'Contact adjuster regarding the pending claim for Smith Trucking accident',
        'On Hold',
        'Urgent',
        NOW(),
        25,
        current_user_id,
        current_user_id
    );
    
    -- Task 5: In Progress, High Priority, Due in 3 days
    INSERT INTO public.tasks (
        title, 
        description, 
        status, 
        priority, 
        due_date, 
        completion_percentage, 
        creator_id, 
        assignee_id
    ) VALUES (
        'Prepare quote for Johnson Construction',
        'Create comprehensive insurance quote for Johnson Construction new project',
        'In Progress',
        'High',
        NOW() + INTERVAL '3 days',
        60,
        current_user_id,
        current_user_id
    );
END $$;
