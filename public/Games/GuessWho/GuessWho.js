

class Character {
    constructor(name, hairColor, glasses, profession, gender, age, skinColor, facialExpression, imageUrl) {
        this.name = name;
        this.hairColor = hairColor; // צבע שיער
        this.glasses = glasses; // האם יש משקפיים
        this.profession = profession; // מקצוע
        this.gender = gender; // מין
        this.age = age; // גיל
        this.skinColor = skinColor; // צבע עור
        this.facialExpression = facialExpression; // הבעה פנים
        this.imageUrl = imageUrl; // נתיב התמונה
    }
}
// hairColor = brown blonde black white
// neutral smiling angry
// middle-aged young  old

const characters = [ 
    new Character('Alice', 'black', false, 'painter', 'female', 'old', 'dark', 'smiling', 'images/Alice.webp'),
    new Character('Bob', 'black', false, 'musician', 'male', 'old', 'dark', 'smiling', 'images/bob.webp'),
    new Character('John', 'brown', false, 'developer', 'male', 'young', 'light', 'angry', 'images/John.webp'),
    new Character('Eva', 'black', false, 'dentist', 'female', 'young', 'dark', 'smiling', 'images/Eva.webp'),
    new Character('Tom', 'brown', false, 'doctor', 'male', 'young', 'light', 'neutral', 'images/Tom.webp'),
    new Character('Mary', 'brown', false, 'nurse', 'female', 'young', 'dark', 'smiling', 'images/Mary.webp'),
    new Character('Sam', 'white', false, 'chef', 'male', 'young', 'light', 'neutral', 'images/Sam.webp'),
    new Character('Laura', 'black', false, 'scientist', 'female', 'young', 'light', 'angry', 'images/Laura.webp'),
    new Character('Charlie', 'black', false, 'engineer', 'male', 'young', 'light', 'smiling', 'images/Charlie.webp'),
    new Character('Sophia', 'white', false, 'teacher', 'female', 'old', 'dark', 'smiling', 'images/Sophia.webp'),
    new Character('Daniel', 'blonde', true, 'plumber', 'male', 'old', 'dark', 'neutral', 'images/Daniel.webp'),
    new Character('Olivia', 'blonde', false, 'librarian', 'female', 'young', 'dark', 'angry', 'images/Olivia.webp'),
    new Character('James', 'brown', false, 'mechanic', 'male', 'young', 'dark', 'angry', 'images/James.webp'),
    new Character('Chloe', 'blonde', false, 'journalist', 'female', 'young', 'light', 'smiling', 'images/Chloe.webp'),
    new Character('Ethan', 'blonde', false, 'architect', 'male', 'young', 'light', 'angry', 'images/Ethan.webp'),
    new Character('Isabella', 'black', false, 'designer', 'female', 'young', 'light', 'angry', 'images/Isabella.webp'),
    new Character('Lucas', 'brown', false, 'developer', 'male', 'young', 'light', 'angry', 'images/Lucas.webp'),
    new Character('Mia', 'brown', true, 'artist', 'female', 'old', 'light', 'neutral', 'images/Mia.webp'),
    new Character('Henry', 'black', false, 'scientist', 'male', 'young', 'light', 'smiling', 'images/Henry.webp'),
    new Character('Lily', 'blonde', false, 'nurse', 'female', 'old', 'light', 'neutral', 'images/Lily.webp'),
    new Character('Jack', 'black', false, 'teacher', 'male', 'old', 'light', 'smiling', 'images/Jack.webp'),
    new Character('Zoe', 'brown', false, 'chef', 'female', 'young', 'light', 'smiling', 'images/Zoe.webp'),
    new Character('Matthew', 'white', false, 'doctor', 'male', 'young', 'light', 'neutral', 'images/Matthew.webp'),
    new Character('Ava', 'white', true, 'designer', 'female', 'old', 'light', 'neutral', 'images/Ava.webp'),
    new Character('Ryan', 'blonde', true, 'artist', 'male', 'old', 'light', 'neutral', 'images/ryan.webp'),
    new Character('Ella', 'black', true, 'scientist', 'female', 'old', 'light', 'neutral', 'images/ella.webp'),
    new Character('William', 'black', true, 'teacher', 'male', 'young', 'light', 'smiling', 'images/William.webp'),
    new Character('Emily', 'white', true, 'developer', 'female', 'old', 'light', 'neutral', 'images/Emily.webp'),
    new Character('Benjamin', 'white', true, 'librarian', 'male', 'old', 'light', 'neutral', 'images/Benjamin.webp'),
    new Character('Charlotte', 'brown', true, 'plumber', 'male', 'old', 'light', 'angry', 'images/Charlotte.webp'),
    new Character('Jacob', 'black', true, 'chef', 'male', 'young', 'light', 'neutral', 'images/Jacob.webp'),
    new Character('Harper', 'blonde', true, 'designer', 'male', 'young', 'light', 'neutral', 'images/harper.webp'),
    new Character('Grace', 'blonde', true, 'nurse', 'female', 'old', 'light', 'neutral', 'images/grace.webp'),
    new Character('Rachel', 'brown', true, 'teacher', 'female', 'young', 'light', 'neutral', 'images/Rachel.webp'),
    new Character('Isabel', 'black', false, 'developer', 'female', 'young', 'dark', 'neutral', 'images/Isabel.webp'),
    new Character('Nathan', 'brown', false, 'artist', 'male', 'old', 'light', 'angry', 'images/Nathan.webp'),
];




// פונקציה להוספת 40 ריבועים
function createTiles() {
    const container = document.getElementById('board'); // מיכל הריבועים
    const numTiles = 36; // מספר הריבועים

    for (let i = 0; i < numTiles; i++) {
        const tile = document.createElement('div'); // יצירת ריבוע חדש
        tile.classList.add('tile'); // הוספת מחלקת 'tile' לריבוע
        tile.id = `tile-${i}`; // הגדרת מזהה לכל ריבוע (tile-1, tile-2, ...)

        tile.style.backgroundImage = `url('${characters[i].imageUrl}')`; // הגדרת התמונה כרקע של הריבוע

        // יצירת אלמנט 'div' עבור נתוני הדמות
        const characterDetails = document.createElement('div');
        characterDetails.classList.add('character-details');
        characterDetails.innerHTML = `
            <strong>name:</strong> ${characters[i].name}<br>
            <strong>age:</strong> ${characters[i].age}<br>
            <strong>profession:</strong> ${characters[i].profession}<br>
            <strong>gender:</strong> ${characters[i].gender}
        `;

        // מוודא שפרטי הדמות לא ייראו עד שהעכבר לא מרחף מעל
        characterDetails.classList.add('hidden');

        // הוספת פרטי הדמות לריבוע
        tile.appendChild(characterDetails);

        container.appendChild(tile); // הוספת הריבוע לתוך המיכל

        // הוספת אירוע hover
        tile.addEventListener('mouseenter', () => {
            characterDetails.classList.remove('hidden');
        });

        tile.addEventListener('mouseleave', () => {
            characterDetails.classList.add('hidden');
        });

         // הוספת אירוע קליק עם בדיקה
         tile.addEventListener('click', () => {
            if (characters[i].name === selectedCharacter.name) {
                alert(`Correct! You found ${selectedCharacter.name}.`);
                VictoryGame();//מעבר לניצחון
            } else {
                alert(`Wrong! This is ${characters[i].name}, not ${selectedCharacter.name}.`);
                document.getElementById('click-counter').textContent = ++clickCount;//מונה נסיונות
                filterCharacters(characters[i])
            }
        });
    }
}


// קריאה לפונקציה
createTiles();

// פונקציה להוספת תמונות לכל ריבוע
function loadCharacterImages() {
    // כל דמות תוצג בריבוע עם מזהה שונה
    characters.forEach((character, index) => {
        // בחר את הריבוע עם המזהה המתאים
        const tile = document.getElementById(`tile-${index + 1}`);
        
        if (tile) {
            // צור אלמנט img
            const img = document.createElement('img');
            img.src = character.imageUrl;
            img.alt = character.name;
            
            // הוסף את התמונה לריבוע
            tile.appendChild(img);
        
        }
    });
}

// קריאה לפונקציה להוספת התמונות
loadCharacterImages();
//הגרלת דמות
const selectedCharacter = characters[Math.floor(Math.random() * characters.length)];
console.log(selectedCharacter.name)



//השחרת הדמות וביטול העכבר
function filterCharacters(character) {
    // מציאת האינדקס של הדמות ברשימה
    const index = characters.findIndex(c => c.name === character.name);
    const tile = document.getElementById(`tile-${index}`); // ID לפי אינדקס
    //השחרת הדמות
    tile.classList.add('dim');
    // ביטול אירוע הקליק על הריבוע
    tile.style.pointerEvents = "none"; // מניעת קליקים נוספים
}



//ניצחון
function VictoryGame() {
    window.location.href = "GuessVictory.html"; //מעבר לדף הניצחון
}


