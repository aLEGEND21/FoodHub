"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Food } from "@/types";
import { getFoods, type GetFoodsResult } from "@/lib/actions/meals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function AddPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [foods, setFoods] = useState<GetFoodsResult>({
    favoriteFoods: [],
    regularFoods: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch foods from database
  useEffect(() => {
    async function fetchFoods() {
      try {
        const fetchedFoods = await getFoods();
        setFoods(fetchedFoods);
      } catch (error) {
        console.error("Error fetching foods:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFoods();
  }, []);

  // Filter foods based on search
  const filteredFoods = useMemo(() => {
    const sortedFavoriteFoods = foods.favoriteFoods.filter((food) =>
      food.name.toLowerCase().includes(search.toLowerCase()),
    );
    const sortedRegularFoods = foods.regularFoods.filter((food) =>
      food.name.toLowerCase().includes(search.toLowerCase()),
    );
    return {
      favoriteFoods: sortedFavoriteFoods,
      regularFoods: sortedRegularFoods,
    };
  }, [search, foods]);

  const handleFoodSelected = (food: Food) => {
    // Navigate to selection page where user can choose meal type and serving size
    router.push(`/add-meal/select/${food.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent, food: Food) => {
    e.stopPropagation();
    // Empty callback handler for now
  };

  return (
    <>
      <main className="mx-auto w-full max-w-md space-y-4 px-4 pt-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Add Meal</h1>
          <p className="text-muted-foreground">
            Select a food to add to your meal log
          </p>
        </div>

        {/* Search Bar */}
        <Input
          type="text"
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg"
        />

        {/* Loading State */}
        {loading && (
          <div className="text-muted-foreground py-8 text-center">
            Loading foods...
          </div>
        )}

        {/* Favorite Foods */}
        {!loading && filteredFoods.favoriteFoods.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm font-semibold">
              Favorites
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {filteredFoods.favoriteFoods.map((food) => (
                <Card
                  key={food.id}
                  onClick={() => handleFoodSelected(food)}
                  className="hover:bg-accent/5 border-accent/30 bg-accent/10 relative cursor-pointer transition-colors"
                >
                  <CardContent className="flex flex-col items-center gap-2 px-3 py-1">
                    <button
                      onClick={(e) => handleFavoriteClick(e, food)}
                      className="absolute top-2 right-2 z-10 p-1 transition-opacity hover:opacity-80"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          food.favorite
                            ? "fill-orange-500 text-orange-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                    <h3 className="mt-1 text-center text-sm font-medium">
                      {food.name}
                    </h3>
                    <span className="text-3xl">{food.icon}</span>
                    <div className="mt-auto flex w-full items-center justify-center gap-2 pt-1">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold">
                          {food.calories}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          cal
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold">
                          {food.protein}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          grams
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Foods Message */}
        {!loading &&
          filteredFoods.favoriteFoods.length === 0 &&
          filteredFoods.regularFoods.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              {search
                ? "No foods found matching your search."
                : "No foods found. Create your first food!"}
            </div>
          )}

        {/* All Foods - Alphabetically Organized */}
        {!loading && filteredFoods.regularFoods.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm font-semibold">
              All Foods
            </h3>
            <div className="grid auto-rows-max grid-cols-2 gap-2">
              {filteredFoods.regularFoods.map((food: Food) => (
                <Card
                  key={food.id}
                  onClick={() => handleFoodSelected(food)}
                  className="hover:bg-accent/5 relative cursor-pointer transition-colors"
                >
                  <CardContent className="flex flex-col items-center gap-3 px-4 py-1">
                    <button
                      onClick={(e) => handleFavoriteClick(e, food)}
                      className="absolute top-2 right-2 z-10 p-1 transition-opacity hover:opacity-80"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          food.favorite
                            ? "fill-orange-500 text-orange-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                    <h3 className="mt-1 text-center text-base font-medium">
                      {food.name}
                    </h3>
                    <span className="text-4xl">{food.icon}</span>
                    <div className="mt-auto flex w-full items-center justify-center gap-4 pt-2">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">
                          {food.calories}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          cal
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">
                          {food.protein}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          grams
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Custom Food Button */}
        <div className="border-border/30 dark:border-border/20 sticky right-0 bottom-0 left-0 z-10 -mx-4 border-t bg-transparent px-4 pt-4 pb-4 backdrop-blur-xs">
          <Button
            onClick={() => router.push("/add-meal/new")}
            className="w-full"
            size="lg"
          >
            Create Custom Food
          </Button>
        </div>
      </main>
    </>
  );
}
