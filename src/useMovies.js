import { useState, useEffect } from "react";

const KEY = "94c28823";

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(
    function () {
      callback?.();

      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setError("");

          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal },
          );

          if (!res.ok) {
            throw new Error("Something went wrong while fetching movie!");
          }

          const data = await res.json();

          if (data.Response === "False") {
            throw new Error("Movies not found");
          }

          setMovies(data.Search);
        } catch (err) {
          if (err.name !== "AbortError") {
            if (err instanceof TypeError && err.message === "Failed to fetch") {
              setError("Something went wrong while fetching movie!");
            } else {
              setError(err.message);
            }
          }
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query],
  );

  return { movies, isLoading, error };
}
