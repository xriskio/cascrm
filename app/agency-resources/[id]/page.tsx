"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addResource } from "@/app/actions/resource-actions";

export default function AddResourcePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  // … other state …
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [resourceType, setResourceType] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Build your payload
    const resource = {
      title,
      description,
      category,
      file_url: fileUrl,
      file_type: resourceType,
    };

    try {
      await addResource(resource as any);
      router.push("/agency-resources");
    } catch (err: any) {
      console.error(err);
      alert("Error adding resource: " + err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* your inputs for title, description, etc. */}
      <button type="submit">Add Resource</button>
    </form>
  );
}
