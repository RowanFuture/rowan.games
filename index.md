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

{% include div_platformer.html %}