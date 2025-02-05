import{_ as h,V as m}from"./AppTextarea.vue_vue_type_script_setup_true_lang-CzC45EXc.js";import{d as x,r as T,o as p,g as d,n as w,ah as V,K as _,f as l,b as e,e as o,t as a}from"./main-Ca4qx7y-.js";import{a as t,V as b}from"./VRow-EsZ_8CZn.js";import{_ as k}from"./AppCardCode.vue_vue_type_style_index_0_lang-Bq5KC9kd.js";import"./form-C6PetfES.js";/* empty css                   */import"./VCounter-DbxmW7Y4.js";import"./VImg-C3GobFkp.js";import"./VField-ZOdg6ueh.js";import"./easing-CjukEv2V.js";import"./VInput-iEBwr0fp.js";import"./forwardRefs-C-GTDzx5.js";/* empty css              */import"./vue3-perfect-scrollbar.esm-CLCcbP0n.js";import"./VCard-k3dQT3Up.js";import"./VAvatar-B3k1LwfD.js";import"./VCardText-iX3erHMv.js";import"./VDivider-CMgOCZ_h.js";const $=x({__name:"DemoTextareaValidation",setup(i){const r=T("Hello!"),c=[s=>s.length<=25||"Max 25 characters"];return(s,n)=>{const u=h;return p(),d(u,{modelValue:w(r),"onUpdate:modelValue":n[0]||(n[0]=f=>V(r)?r.value=f:null),label:"Validation",rules:c,rows:"2",placeholder:"Placeholder Text"},null,8,["modelValue"])}}}),j=x({__name:"DemoTextareaNoResize",setup(i){const r=T("Marshmallow tiramisu pie dessert gingerbread tart caramels marzipan oat cake. Muffin sesame snaps cupcake bonbon cookie tiramisu. Pudding biscuit gingerbread halvah lollipop jelly-o cookie.");return(c,s)=>{const n=h;return p(),d(n,{modelValue:w(r),"onUpdate:modelValue":s[0]||(s[0]=u=>V(r)?r.value=u:null),label:"Text","no-resize":"",rows:"2",placeholder:"Placeholder Text"},null,8,["modelValue"])}}}),z={};function H(i,r){const c=h;return p(),d(b,null,{default:l(()=>[e(t,{cols:"12",sm:"6"},{default:l(()=>[e(c,{label:"One row","auto-grow":"",rows:"1","row-height":"15",placeholder:"Placeholder Text"})]),_:1}),e(t,{cols:"12",sm:"6"},{default:l(()=>[e(c,{"auto-grow":"",label:"Two rows",rows:"2",placeholder:"Placeholder Text","row-height":"20"})]),_:1}),e(t,{cols:"12",sm:"6"},{default:l(()=>[e(c,{label:"Three rows","auto-grow":"",rows:"3",placeholder:"Placeholder Text","row-height":"25"})]),_:1}),e(t,{cols:"12",sm:"6"},{default:l(()=>[e(c,{"auto-grow":"",label:"Four rows",placeholder:"Placeholder Text",rows:"4","row-height":"30"})]),_:1})]),_:1})}const U=_(z,[["render",H]]),M={};function B(i,r){const c=h;return p(),d(b,null,{default:l(()=>[e(t,{cols:"12"},{default:l(()=>[e(c,{label:"Prepend-icon",rows:"1",placeholder:"Placeholder Text","prepend-icon":"bx-message-detail"})]),_:1}),e(t,{cols:"12"},{default:l(()=>[e(c,{"append-icon":"bx-message-detail",placeholder:"Placeholder Text",label:"Append-icon",rows:"1"})]),_:1}),e(t,{cols:"12"},{default:l(()=>[e(c,{"prepend-inner-icon":"bx-message-detail",label:"Prepend-inner-icon",placeholder:"Placeholder Text",rows:"1"})]),_:1}),e(t,{cols:"12"},{default:l(()=>[e(c,{"append-inner-icon":"bx-message-detail",label:"Append-inner-icon",placeholder:"Placeholder Text",rows:"1"})]),_:1})]),_:1})}const G=_(M,[["render",B]]),F=x({__name:"DemoTextareaCounter",setup(i){const r=T("Hello!");return(c,s)=>{const n=h;return p(),d(n,{modelValue:w(r),"onUpdate:modelValue":s[0]||(s[0]=u=>V(r)?r.value=u:null),counter:"",label:"Text",placeholder:"Placeholder Text"},null,8,["modelValue"])}}}),N=x({__name:"DemoTextareaClearable",setup(i){const r=T("This is clearable text.");return(c,s)=>{const n=h;return p(),d(n,{modelValue:w(r),"onUpdate:modelValue":s[0]||(s[0]=u=>V(r)?r.value=u:null),clearable:"","clear-icon":"bx-x-circle",label:"Text",placeholder:"Placeholder Text"},null,8,["modelValue"])}}}),O={};function S(i,r){const c=h;return p(),d(c,{autocomplete:"email",label:"Email",placeholder:"johndoe@email.com"})}const W=_(O,[["render",S]]),E={};function I(i,r){const c=h;return p(),d(b,null,{default:l(()=>[e(t,{cols:"12"},{default:l(()=>[e(c,{disabled:"",label:"Disabled",hint:"Hint text",placeholder:"Placeholder Text",rows:"2"})]),_:1}),e(t,{cols:"12"},{default:l(()=>[e(c,{readonly:"",rows:"2",label:"Readonly",placeholder:"Placeholder Text",hint:"Hint text"})]),_:1})]),_:1})}const K=_(E,[["render",I]]),Y={};function q(i,r){return p(),d(b,null,{default:l(()=>[e(t,{cols:"12",sm:"6"},{default:l(()=>[e(m,{label:"Default",rows:"2",placeholder:"Placeholder Text"})]),_:1}),e(t,{cols:"12",sm:"6"},{default:l(()=>[e(m,{label:"Solo",placeholder:"Placeholder Text",rows:"2",variant:"solo"})]),_:1}),e(t,{cols:"12",sm:"6"},{default:l(()=>[e(m,{label:"Filled",rows:"2",placeholder:"Placeholder Text",variant:"filled"})]),_:1}),e(t,{cols:"12",sm:"6"},{default:l(()=>[e(m,{label:"Outlined",rows:"2",placeholder:"Placeholder Text",variant:"outlined"})]),_:1}),e(t,{cols:"12",sm:"6"},{default:l(()=>[e(m,{label:"Underlined",rows:"2",placeholder:"Placeholder Text",variant:"underlined"})]),_:1}),e(t,{cols:"12",sm:"6"},{default:l(()=>[e(m,{label:"Plain",rows:"2",placeholder:"Placeholder Text",variant:"plain"})]),_:1})]),_:1})}const J=_(Y,[["render",q]]),L=x({__name:"DemoTextareaAutoGrow",setup(i){const r=T("The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.");return(c,s)=>{const n=h;return p(),d(n,{modelValue:w(r),"onUpdate:modelValue":s[0]||(s[0]=u=>V(r)?r.value=u:null),label:"Auto Grow",placeholder:"Placeholder Text","auto-grow":""},null,8,["modelValue"])}}}),Q={};function X(i,r){const c=h;return p(),d(c,{label:"Default",placeholder:"Placeholder Text"})}const Z=_(Q,[["render",X]]),ee={ts:`<script setup lang="ts">
const textareaValue = ref('The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.')
<\/script>

<template>
  <AppTextarea
    v-model="textareaValue"
    label="Auto Grow"
    placeholder="Placeholder Text"
    auto-grow
  />
</template>
`,js:`<script setup>
const textareaValue = ref('The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through.')
<\/script>

<template>
  <AppTextarea
    v-model="textareaValue"
    label="Auto Grow"
    placeholder="Placeholder Text"
    auto-grow
  />
</template>
`},le={ts:`<template>
  <AppTextarea
    label="Default"
    placeholder="Placeholder Text"
  />
</template>
`,js:`<template>
  <AppTextarea
    label="Default"
    placeholder="Placeholder Text"
  />
</template>
`},oe={ts:`<template>
  <AppTextarea
    autocomplete="email"
    label="Email"
    placeholder="johndoe@email.com"
  />
</template>
`,js:`<template>
  <AppTextarea
    autocomplete="email"
    label="Email"
    placeholder="johndoe@email.com"
  />
</template>
`},ae={ts:`<script setup lang="ts">
const textareaValue = ref('This is clearable text.')
<\/script>

<template>
  <AppTextarea
    v-model="textareaValue"
    clearable
    clear-icon="bx-x-circle"
    label="Text"
    placeholder="Placeholder Text"
  />
</template>
`,js:`<script setup>
const textareaValue = ref('This is clearable text.')
<\/script>

<template>
  <AppTextarea
    v-model="textareaValue"
    clearable
    clear-icon="bx-x-circle"
    label="Text"
    placeholder="Placeholder Text"
  />
</template>
`},te={ts:`<script lang="ts" setup>
const textareaValue = ref('Hello!')
<\/script>

<template>
  <AppTextarea
    v-model="textareaValue"
    counter
    label="Text"
    placeholder="Placeholder Text"
  />
</template>
`,js:`<script setup>
const textareaValue = ref('Hello!')
<\/script>

<template>
  <AppTextarea
    v-model="textareaValue"
    counter
    label="Text"
    placeholder="Placeholder Text"
  />
</template>
`},re={ts:`<template>
  <VRow>
    <VCol cols="12">
      <AppTextarea
        label="Prepend-icon"
        rows="1"
        placeholder="Placeholder Text"
        prepend-icon="bx-message-detail"
      />
    </VCol>

    <VCol cols="12">
      <AppTextarea
        append-icon="bx-message-detail"
        placeholder="Placeholder Text"
        label="Append-icon"
        rows="1"
      />
    </VCol>

    <VCol cols="12">
      <AppTextarea
        prepend-inner-icon="bx-message-detail"
        label="Prepend-inner-icon"
        placeholder="Placeholder Text"
        rows="1"
      />
    </VCol>

    <VCol cols="12">
      <AppTextarea
        append-inner-icon="bx-message-detail"
        label="Append-inner-icon"
        placeholder="Placeholder Text"
        rows="1"
      />
    </VCol>
  </VRow>
</template>
`,js:`<template>
  <VRow>
    <VCol cols="12">
      <AppTextarea
        label="Prepend-icon"
        rows="1"
        placeholder="Placeholder Text"
        prepend-icon="bx-message-detail"
      />
    </VCol>

    <VCol cols="12">
      <AppTextarea
        append-icon="bx-message-detail"
        placeholder="Placeholder Text"
        label="Append-icon"
        rows="1"
      />
    </VCol>

    <VCol cols="12">
      <AppTextarea
        prepend-inner-icon="bx-message-detail"
        label="Prepend-inner-icon"
        placeholder="Placeholder Text"
        rows="1"
      />
    </VCol>

    <VCol cols="12">
      <AppTextarea
        append-inner-icon="bx-message-detail"
        label="Append-inner-icon"
        placeholder="Placeholder Text"
        rows="1"
      />
    </VCol>
  </VRow>
</template>
`},ce={ts:`<script lang="ts" setup>
const value = ref('Marshmallow tiramisu pie dessert gingerbread tart caramels marzipan oat cake. Muffin sesame snaps cupcake bonbon cookie tiramisu. Pudding biscuit gingerbread halvah lollipop jelly-o cookie.')
<\/script>

<template>
  <AppTextarea
    v-model="value"
    label="Text"
    no-resize
    rows="2"
    placeholder="Placeholder Text"
  />
</template>
`,js:`<script setup>
const value = ref('Marshmallow tiramisu pie dessert gingerbread tart caramels marzipan oat cake. Muffin sesame snaps cupcake bonbon cookie tiramisu. Pudding biscuit gingerbread halvah lollipop jelly-o cookie.')
<\/script>

<template>
  <AppTextarea
    v-model="value"
    label="Text"
    no-resize
    rows="2"
    placeholder="Placeholder Text"
  />
</template>
`},ne={ts:`<template>
  <VRow>
    <VCol
      cols="12"
      sm="6"
    >
      <AppTextarea
        label="One row"
        auto-grow
        rows="1"
        row-height="15"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <AppTextarea
        auto-grow
        label="Two rows"
        rows="2"
        placeholder="Placeholder Text"
        row-height="20"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <AppTextarea
        label="Three rows"
        auto-grow
        rows="3"
        placeholder="Placeholder Text"
        row-height="25"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <AppTextarea
        auto-grow
        label="Four rows"
        placeholder="Placeholder Text"
        rows="4"
        row-height="30"
      />
    </VCol>
  </VRow>
</template>
`,js:`<template>
  <VRow>
    <VCol
      cols="12"
      sm="6"
    >
      <AppTextarea
        label="One row"
        auto-grow
        rows="1"
        row-height="15"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <AppTextarea
        auto-grow
        label="Two rows"
        rows="2"
        placeholder="Placeholder Text"
        row-height="20"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <AppTextarea
        label="Three rows"
        auto-grow
        rows="3"
        placeholder="Placeholder Text"
        row-height="25"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <AppTextarea
        auto-grow
        label="Four rows"
        placeholder="Placeholder Text"
        rows="4"
        row-height="30"
      />
    </VCol>
  </VRow>
</template>
`},se={ts:`<template>
  <VRow>
    <VCol cols="12">
      <AppTextarea
        disabled
        label="Disabled"
        hint="Hint text"
        placeholder="Placeholder Text"
        rows="2"
      />
    </VCol>

    <VCol cols="12">
      <AppTextarea
        readonly
        rows="2"
        label="Readonly"
        placeholder="Placeholder Text"
        hint="Hint text"
      />
    </VCol>
  </VRow>
</template>
`,js:`<template>
  <VRow>
    <VCol cols="12">
      <AppTextarea
        disabled
        label="Disabled"
        hint="Hint text"
        placeholder="Placeholder Text"
        rows="2"
      />
    </VCol>

    <VCol cols="12">
      <AppTextarea
        readonly
        rows="2"
        label="Readonly"
        placeholder="Placeholder Text"
        hint="Hint text"
      />
    </VCol>
  </VRow>
</template>
`},pe={ts:`<script lang="ts" setup>
const textareaValue = ref('Hello!')
const rules = [(v: string) => v.length <= 25 || 'Max 25 characters']
<\/script>

<template>
  <AppTextarea
    v-model="textareaValue"
    label="Validation"
    :rules="rules"
    rows="2"
    placeholder="Placeholder Text"
  />
</template>
`,js:`<script setup>
const textareaValue = ref('Hello!')
const rules = [v => v.length <= 25 || 'Max 25 characters']
<\/script>

<template>
  <AppTextarea
    v-model="textareaValue"
    label="Validation"
    :rules="rules"
    rows="2"
    placeholder="Placeholder Text"
  />
</template>
`},de={ts:`<template>
  <VRow>
    <VCol
      cols="12"
      sm="6"
    >
      <VTextarea
        label="Default"
        rows="2"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VTextarea
        label="Solo"
        placeholder="Placeholder Text"
        rows="2"
        variant="solo"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VTextarea
        label="Filled"
        rows="2"
        placeholder="Placeholder Text"
        variant="filled"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VTextarea
        label="Outlined"
        rows="2"
        placeholder="Placeholder Text"
        variant="outlined"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VTextarea
        label="Underlined"
        rows="2"
        placeholder="Placeholder Text"
        variant="underlined"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VTextarea
        label="Plain"
        rows="2"
        placeholder="Placeholder Text"
        variant="plain"
      />
    </VCol>
  </VRow>
</template>
`,js:`<template>
  <VRow>
    <VCol
      cols="12"
      sm="6"
    >
      <VTextarea
        label="Default"
        rows="2"
        placeholder="Placeholder Text"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VTextarea
        label="Solo"
        placeholder="Placeholder Text"
        rows="2"
        variant="solo"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VTextarea
        label="Filled"
        rows="2"
        placeholder="Placeholder Text"
        variant="filled"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VTextarea
        label="Outlined"
        rows="2"
        placeholder="Placeholder Text"
        variant="outlined"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VTextarea
        label="Underlined"
        rows="2"
        placeholder="Placeholder Text"
        variant="underlined"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VTextarea
        label="Plain"
        rows="2"
        placeholder="Placeholder Text"
        variant="plain"
      />
    </VCol>
  </VRow>
</template>
`},ie=o("p",null," v-textarea in its simplest form is a multi-line text-field, useful for larger amounts of text. ",-1),ue=o("p",null,[a("When using the "),o("code",null,"auto-grow"),a(" prop, textarea's will automatically increase in size when the contained text exceeds its size.")],-1),he=o("p",null,[a("Use "),o("code",null,"filled"),a(", "),o("code",null,"plain"),a(", "),o("code",null,"outlined"),a(", "),o("code",null,"solo"),a(" and "),o("code",null,"underlined"),a(" option of "),o("code",null,"variant"),a(" prop to change the look of file input.")],-1),me=o("p",null,[a("Use "),o("code",null,"disabled"),a(" and "),o("code",null,"readonly"),a(" prop to change the state of textarea.")],-1),xe=o("p",null,[a(" The "),o("code",null,"autocomplete"),a(" prop gives you the option to enable the browser to predict user input. ")],-1),_e=o("p",null,[a("You can clear the text from a "),o("code",null,"v-textarea"),a(" by using the "),o("code",null,"clearable"),a(" prop, and customize the icon used with the "),o("code",null,"clearable-icon"),a(" prop.")],-1),Te=o("p",null,[a(" The "),o("code",null,"counter"),a(" prop informs the user of a character limit for the "),o("code",null,"v-textarea"),a(". ")],-1),we=o("p",null,[a("The "),o("code",null,"append-icon"),a(", "),o("code",null,"prepend-icon"),a(", "),o("code",null,"append-inner-icon"),a(" and "),o("code",null,"prepend-inner-icon"),a(" props help add context to v-textarea.")],-1),Ve=o("p",null,[a("The "),o("code",null,"rows"),a(" prop allows you to define how many rows the textarea has, when combined with the "),o("code",null,"row-height"),a(" prop you can further customize your rows by defining their height.")],-1),be=o("p",null,[o("code",null,"v-textarea"),a("'s have the option to remain the same size regardless of their content's size, using the "),o("code",null,"no-resize"),a(" prop.")],-1),fe=o("p",null,[a("Use "),o("code",null,"rules"),a(" prop to validate the textarea.")],-1),Ne=x({__name:"textarea",setup(i){return(r,c)=>{const s=Z,n=k,u=L,f=J,g=K,P=W,C=N,A=F,v=G,R=U,D=j,y=$;return p(),d(b,{class:"match-height"},{default:l(()=>[e(t,{cols:"12",md:"6"},{default:l(()=>[e(n,{title:"Basic",code:le},{default:l(()=>[ie,e(s)]),_:1},8,["code"])]),_:1}),e(t,{cols:"12",md:"6"},{default:l(()=>[e(n,{title:"Auto Grow",code:ee},{default:l(()=>[ue,e(u)]),_:1},8,["code"])]),_:1}),e(t,{cols:"12"},{default:l(()=>[e(n,{title:"Variant",code:de},{default:l(()=>[he,e(f)]),_:1},8,["code"])]),_:1}),e(t,{cols:"12",md:"6"},{default:l(()=>[e(n,{title:"States",code:se},{default:l(()=>[me,e(g)]),_:1},8,["code"])]),_:1}),e(t,{cols:"12",md:"6"},{default:l(()=>[e(n,{title:"Browser autocomplete",code:oe},{default:l(()=>[xe,e(P)]),_:1},8,["code"])]),_:1}),e(t,{cols:"12",md:"6"},{default:l(()=>[e(n,{title:"Clearable",code:ae},{default:l(()=>[_e,e(C)]),_:1},8,["code"])]),_:1}),e(t,{cols:"12",md:"6"},{default:l(()=>[e(n,{title:"Counter",code:te},{default:l(()=>[Te,e(A)]),_:1},8,["code"])]),_:1}),e(t,{cols:"12",md:"6"},{default:l(()=>[e(n,{title:"Icons",code:re},{default:l(()=>[we,e(v)]),_:1},8,["code"])]),_:1}),e(t,{cols:"12",md:"6"},{default:l(()=>[e(n,{title:"Rows",code:ne},{default:l(()=>[Ve,e(R)]),_:1},8,["code"])]),_:1}),e(t,{cols:"12",md:"6"},{default:l(()=>[e(n,{title:"No resize",code:ce},{default:l(()=>[be,e(D)]),_:1},8,["code"])]),_:1}),e(t,{cols:"12",md:"6"},{default:l(()=>[e(n,{title:"Validation",code:pe},{default:l(()=>[fe,e(y)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{Ne as default};
