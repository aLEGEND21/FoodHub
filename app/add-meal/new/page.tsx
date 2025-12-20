"use client";

import { useState, useActionState } from "react";
import Form from "next/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createFood } from "@/lib/actions/meals";

export default function NewMealPage() {
  const [state, formAction, isPending] = useActionState(createFood, null);
  const [preview, setPreview] = useState({
    name: "",
    emoji: "",
    calories: "",
    protein: "",
  });

  return (
    <main className="mx-auto w-full max-w-md space-y-4 px-4 pt-6 pb-20 md:pb-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create Custom Food</h1>
        <p className="text-muted-foreground">
          Add a new food option to your library
        </p>
      </div>

      {/* Preview Card */}
      <Card className="bg-muted/30 border-0 shadow-none">
        <CardContent className="flex flex-col items-center gap-6 px-6 py-6">
          <h3 className="mt-1 text-center text-2xl font-medium">
            {preview.name || "Food Name"}
          </h3>
          <span className="text-7xl">{preview.emoji || "🍽️"}</span>
          <div className="mt-auto flex w-full items-center justify-center gap-6 pt-2">
            <div className="flex flex-col items-center">
              <span className="text-primary text-xl font-bold">
                {preview.calories || "0"}
              </span>
              <span className="text-muted-foreground text-base">cal</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-primary text-xl font-bold">
                {preview.protein || "0"}
              </span>
              <span className="text-muted-foreground text-base">grams</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <div>
        {state && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive mb-4 rounded-lg border p-3 text-sm">
            {state.message}
          </div>
        )}
        <Form action={formAction} className="space-y-4">
          {/* Food Name Input */}
          <div className="space-y-2">
            <label htmlFor="food-name" className="text-sm font-medium">
              Food Name
            </label>
            <Input
              id="food-name"
              name="name"
              type="text"
              placeholder="e.g., Grilled Salmon"
              className="rounded-lg"
              value={preview.name}
              onChange={(e) => setPreview({ ...preview, name: e.target.value })}
              required
            />
          </div>

          {/* Calories Input */}
          <div className="space-y-2">
            <label htmlFor="calories" className="text-sm font-medium">
              Calories
            </label>
            <Input
              id="calories"
              name="calories"
              type="number"
              placeholder="e.g., 350"
              className="rounded-lg"
              min="1"
              value={preview.calories}
              onChange={(e) =>
                setPreview({ ...preview, calories: e.target.value })
              }
              required
            />
          </div>

          {/* Protein Input */}
          <div className="space-y-2">
            <label htmlFor="protein" className="text-sm font-medium">
              Protein (g)
            </label>
            <Input
              id="protein"
              name="protein"
              type="number"
              placeholder="e.g., 25"
              className="rounded-lg"
              min="0"
              value={preview.protein}
              onChange={(e) =>
                setPreview({ ...preview, protein: e.target.value })
              }
              required
            />
          </div>

          {/* Emoji Input */}
          <div className="space-y-2">
            <label htmlFor="emoji" className="text-sm font-medium">
              Emoji
            </label>
            <Input
              id="emoji"
              name="emoji"
              type="text"
              placeholder="e.g., 🐟"
              className="rounded-lg"
              maxLength={2}
              value={preview.emoji}
              onChange={(e) =>
                setPreview({ ...preview, emoji: e.target.value })
              }
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Creating..." : "Create Food"}
            </Button>
          </div>
        </Form>
      </div>
    </main>
  );
}
