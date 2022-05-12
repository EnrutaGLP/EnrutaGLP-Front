<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
.contenedorPrincipal {
  padding: 20px 60px !important;
  background-color: var(--wb1pto5) !important;
  display: flex;
  flex-flow: column;
  height: 105%;
}

</style>