import { api_random } from '../api/api.js';
import { information } from './information.js';

const brandTrack = document.getElementById('brand-track');
const brandTitle = document.getElementById('brand-title');
brandTitle.innerText = 'מה נכין היום ?';//בשביל מתכונים דומים שיהיה אפשר לשנות לכן זה פה

export async function printSlider(numberOfRecipes = 10) {
    const arr_recipes = await api_random(numberOfRecipes);

    console.log(arr_recipes);
    const brandGroup = document.createElement('div');
    brandGroup.classList.add('brand-group');

    if (arr_recipes.status === 'failure') {
        const noResults = document.createElement("div");
        noResults.classList.add("no-results");
        noResults.innerHTML = `
        <div class="chase-animation">
            <span class="chef">👨‍🍳</span>
            <span class="food">🍕</span>
        </div>
        <p class="message">לא מצאנו את מה שחיפשת... הטבח עדיין מחפש אותו!</p>`;
        brandGroup.appendChild(noResults);
        return brandGroup;
    }


    arr_recipes.recipes.forEach(recipe => {
        const divSliderRecipes = document.createElement("div");
        divSliderRecipes.classList.add('buttonSliderRecipes');
        divSliderRecipes.id = recipe.id;

        const img = document.createElement("img");
        img.src = recipe.image;
        img.alt = recipe.title;
        img.classList.add('slider-recipe-img');

        const h3 = document.createElement("h3");
        h3.textContent = recipe.title;
        h3.classList.add('slider-recipe-title');

        divSliderRecipes.appendChild(img);
        divSliderRecipes.appendChild(h3);
        brandGroup.appendChild(divSliderRecipes);

        divSliderRecipes.addEventListener('click', () => {
            information(divSliderRecipes.id);
        })
    });
    return brandGroup;
}


const arr = await printSlider();
brandTrack.appendChild(arr);


