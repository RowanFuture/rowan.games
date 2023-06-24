---
layout: default
title: ""
---

<br>

<div class="landing-page">

	<p class="section-title">GAMES</p>

	{% include project_card_section.html data = site.games %}
	
	<p class="section-title">PROJECTS</p>

	{% include project_card_section.html data = site.projects %}
	
</div>

<script>

	function wc_hex_is_light(color) {
		const hex = color.replace('#', '');
		const c_r = parseInt(hex.substring(0, 0 + 2), 16);
		const c_g = parseInt(hex.substring(2, 2 + 2), 16);
		const c_b = parseInt(hex.substring(4, 4 + 2), 16);
		const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
		return brightness > 155;
	}

	const getRandomHslColor = () => {
		// Define an async function that returns a random number within a range
		const getRandomNumber = (min, max) =>
			Math.round(Math.random() * (max - min) + min);

		// Destructure an object that contains three random numbers for hue, saturation and lightness
		const { hue, saturation, lightness } = {
			hue: getRandomNumber(0, 360),
			saturation: getRandomNumber(20, 90),
			lightness: getRandomNumber(20, 90),
		};
		// Return the string with hsl prefix
		return {
			hue: hue,
			saturation: saturation,
			lightness: lightness,
			text: `hsl(${hue}, ${saturation}%, ${lightness}%)`
		};
	};
	
	const getRandomColor = () => {

		const colors = [
			'#100354',
			'#2096dd',
			'#ff7d1f',
			'#f897ba',
			'#35bd91',
			'#63d0c3',
			'#8ccde7',
			'#50d86b',
		];

		return colors[Math.floor(Math.random() * colors.length)];
	}

	const grid_items = document.getElementsByClassName("grid-item");

	for(let i = 0; i < grid_items.length; i++){
		const _col = getRandomColor();
		grid_items[i].querySelector('.gamecard').style['background-color'] = _col;
		//.lightness < 50
		grid_items[i].querySelector('.img-center').children[0].style['color'] = wc_hex_is_light(_col) ? 'black' : 'white';
	}
</script>

{% include div_platformer.html %}