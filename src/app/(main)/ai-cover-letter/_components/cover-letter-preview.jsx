"use client";

import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Save, Eye } from "lucide-react";

const CoverLetterPreview = ({ content }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content);

  return (
    <Card className="bg-cream p-6 border-4 border-black rounded-xl shadow-neu">
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant="outline"
          className="gap-2"
        >
          {isEditing ? (
            <>
              <Eye className="h-4 w-4" />
              Preview
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4" />
              Edit
            </>
          )}
        </Button>
      </div>
      <div data-color-mode="light">
        <MDEditor
          value={value}
          onChange={setValue}
          preview={isEditing ? "edit" : "preview"}
          height={700}
          className="!bg-white rounded-lg overflow-hidden"
          previewOptions={{
            className: "!bg-white !text-charcoal prose max-w-none p-6"
          }}
        />
      </div>
      {isEditing && (
        <div className="flex justify-end mt-4">
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      )}
    </Card>
  );
};

export default CoverLetterPreview;
