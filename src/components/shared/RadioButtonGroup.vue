<template>
    <v-radio-group v-model="radioGroup">
        <v-radio
        color="black"
        v-for="n in 4"
        :key="n"
        :label="`Radio ${n}`"
        :value="n"
        ></v-radio>
    </v-radio-group>
</template>

<script>
export default {
    name: 'RadioButtonGroup'
}
</script>>
