-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  type TEXT NOT NULL,
  reference_id TEXT,
  reference_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);

-- Create function to create notifications for new records
CREATE OR REPLACE FUNCTION create_notification_for_new_record()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_link TEXT;
  user_record RECORD;
BEGIN
  -- Set notification details based on the table
  CASE TG_TABLE_NAME
    WHEN 'submissions' THEN
      notification_title := 'New Submission';
      notification_message := 'A new submission has been created: ' || COALESCE(NEW.submission_number, 'Unknown');
      notification_link := '/submissions/view/' || NEW.id;
    WHEN 'leads' THEN
      notification_title := 'New Lead';
      notification_message := 'A new lead has been created: ' || COALESCE(NEW.name, 'Unknown');
      notification_link := '/leads';
    WHEN 'incoming_calls' THEN
      notification_title := 'New Call Log';
      notification_message := 'A new call has been logged: ' || COALESCE(NEW.contact_name, 'Unknown');
      notification_link := '/call-log';
    WHEN 'service_requests' THEN
      notification_title := 'New Service Request';
      notification_message := 'A new service request has been created: ' || COALESCE(NEW.client_name, 'Unknown');
      notification_link := '/service-requests/view/' || NEW.id;
    WHEN 'tasks' THEN
      notification_title := 'New Task';
      notification_message := 'A new task has been created: ' || COALESCE(NEW.title, 'Unknown');
      notification_link := '/tasks/' || NEW.id;
    WHEN 'renewals' THEN
      notification_title := 'New Renewal';
      notification_message := 'A new renewal has been created: ' || COALESCE(NEW.renewal_id, 'Unknown');
      notification_link := '/renewals/' || NEW.id;
    ELSE
      RETURN NEW;
  END CASE;

  -- Create notifications for all users with admin or manager role
  FOR user_record IN 
    SELECT id FROM users WHERE role IN ('admin', 'manager')
  LOOP
    INSERT INTO notifications (
      user_id,
      title,
      message,
      link,
      type,
      reference_id,
      reference_type,
      is_read
    ) VALUES (
      user_record.id,
      notification_title,
      notification_message,
      notification_link,
      'new_record',
      NEW.id::TEXT,
      TG_TABLE_NAME,
      FALSE
    );
  END LOOP;

  -- If the table has an assignee_id or similar, create a notification for that user
  IF TG_TABLE_NAME = 'tasks' AND NEW.assignee_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      link,
      type,
      reference_id,
      reference_type,
      is_read
    ) VALUES (
      NEW.assignee_id,
      'Task Assigned',
      'You have been assigned a new task: ' || COALESCE(NEW.title, 'Unknown'),
      '/tasks/' || NEW.id,
      'assignment',
      NEW.id::TEXT,
      'tasks',
      FALSE
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table
DROP TRIGGER IF EXISTS submissions_notification_trigger ON submissions;
CREATE TRIGGER submissions_notification_trigger
AFTER INSERT ON submissions
FOR EACH ROW
EXECUTE FUNCTION create_notification_for_new_record();

DROP TRIGGER IF EXISTS leads_notification_trigger ON leads;
CREATE TRIGGER leads_notification_trigger
AFTER INSERT ON leads
FOR EACH ROW
EXECUTE FUNCTION create_notification_for_new_record();

DROP TRIGGER IF EXISTS incoming_calls_notification_trigger ON incoming_calls;
CREATE TRIGGER incoming_calls_notification_trigger
AFTER INSERT ON incoming_calls
FOR EACH ROW
EXECUTE FUNCTION create_notification_for_new_record();

DROP TRIGGER IF EXISTS service_requests_notification_trigger ON service_requests;
CREATE TRIGGER service_requests_notification_trigger
AFTER INSERT ON service_requests
FOR EACH ROW
EXECUTE FUNCTION create_notification_for_new_record();

DROP TRIGGER IF EXISTS tasks_notification_trigger ON tasks;
CREATE TRIGGER tasks_notification_trigger
AFTER INSERT ON tasks
FOR EACH ROW
EXECUTE FUNCTION create_notification_for_new_record();

DROP TRIGGER IF EXISTS renewals_notification_trigger ON renewals;
CREATE TRIGGER renewals_notification_trigger
AFTER INSERT ON renewals
FOR EACH ROW
EXECUTE FUNCTION create_notification_for_new_record();

-- Disable RLS for notifications table
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON notifications TO PUBLIC;
GRANT ALL ON notifications TO service_role;
