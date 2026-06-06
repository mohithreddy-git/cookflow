import axios from 'axios';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Search meals by dish name (free tier returns 1 result)
 */
export async function searchMeals(query) {
  const { data } = await axios.get(`${BASE_URL}/search.php`, {
    params: { s: query },
  });
  return data.meals || [];
}

/**
 * Get full recipe details by meal ID
 */
export async function getMealById(id) {
  const { data } = await axios.get(`${BASE_URL}/lookup.php`, {
    params: { i: id },
  });
  return data.meals ? data.meals[0] : null;
}

/**
 * Extract clean ingredients array with measures from meal object
 */
export function extractIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        name: ingredient.trim(),
        measure: measure ? measure.trim() : '',
      });
    }
  }
  return ingredients;
}

/**
 * Extract YouTube video ID from a meal's strYoutube URL
 */
export function extractVideoId(youtubeUrl) {
  if (!youtubeUrl) return null;
  const match = youtubeUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}
