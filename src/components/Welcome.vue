<template>
  <div class="container">
	<div class="row">
		<div class="column"></div>
		<h3 style="text-align:center;"> Neuronapixel </h3>
	    <p>Web development, scripting, hacking, coding, creatividad; la multimedia como lenguaje de incontables interpretaciones en la que cada experiencia es un mensaje diferente.
		</p>
		<p>Neuronapixel cree en el valor intrínseco de la interacción como vehículo para el transito de las ideas.</p>
		<h5>Experimentos:</h5>
	    <ul>
		  <li>
		    WebVR
		    <ul>
		      <li><router-link to="/vr-ama">VR-ama</router-link></li>
		      <li><router-link to="/memoria-virtual">Memoria Virtual</router-link></li>
		    </ul>
		  </li>
		  <li>
		    VR
		  </li>
		  <li>
		    Processing
		    <ul>
		    	<li><router-link to="/neurona-tornasol">Neurona Tornasol</router-link></li>
		    </ul>
		  </li>
		  <li>
		    Arduino
		  </li>
		  <li>
		    Kinect
		  </li>
		  <li>
		    Web
		  </li>
		</ul>
	</div>
	</div>
</template>

<script lang="ts">
import {Vue} from "vue-property-decorator";
export default class Welcome extends Vue{

}
</script>

<style>

</style>