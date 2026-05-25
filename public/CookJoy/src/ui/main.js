


/*
import '../css/header.css';
import '../css/favourites.css';
import '../css/slider.css';
import '../css/information.css';
import '../css/searchInput.css';
import '../css/game.css';
import '../css/Loader.css';
import '../css/video.css';

import './video.js';
import './darkMode.js';
import { api_random_jokes } from '../api/api.js';
import './favourites.js';
import './slider.js'
import './game.js'
import './searchInput.js'
*/





//==============================================================================================================================================
//בדיחה
const jokes = document.getElementById('jokes');
const data = await api_random_jokes()
jokes.innerText = data.text




















