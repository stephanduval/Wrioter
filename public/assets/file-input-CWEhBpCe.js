import{_ as r}from"./AppFileInput.vue_vue_type_script_setup_true_lang-DPxRGVp9.js";import{d as F,r as b,w as j,o as c,g as s,n as g,ah as I,f as n,c as S,F as N,i as L,t,v as U,K as m,b as e,e as l}from"./main-BaC4daP5.js";import{V as k}from"./VChip-Cpn43Xaw.js";import{a,V}from"./VRow-MD441sKt.js";import{V as h}from"./VFileInput-Yx1-r87J.js";import{_ as B}from"./AppCardCode.vue_vue_type_style_index_0_lang-CUZ3RA7S.js";import"./form-Bx6DrHT2.js";import"./VSlideGroup-CruuC3Lo.js";import"./VAvatar-C7kH6m2U.js";import"./VImg-DaBIesWz.js";/* empty css              */import"./VField-CelNtUMo.js";import"./easing-CjukEv2V.js";import"./VInput-khHNYcPy.js";import"./forwardRefs-C-GTDzx5.js";import"./VCounter-BXlqD8Be.js";import"./vue3-perfect-scrollbar.esm-DnoJNS1m.js";import"./VCard-B5K8V0Oe.js";import"./VCardText-yg2yyEKt.js";import"./VDivider-OHXYM3-S.js";const P=F({__name:"DemoFileInputLoading",setup(u){const i=b(),o=b(!0);return j(i,()=>{o.value=!i.value[0]}),(_,p)=>{const d=r;return c(),s(d,{modelValue:g(i),"onUpdate:modelValue":p[0]||(p[0]=f=>I(i)?i.value=f:null),loading:g(o),color:"primary",label:"File input",variant:"outlined"},null,8,["modelValue","loading"])}}}),R=F({__name:"DemoFileInputSelectionSlot",setup(u){const i=b([]);return(o,_)=>{const p=r;return c(),s(p,{modelValue:g(i),"onUpdate:modelValue":_[0]||(_[0]=d=>I(i)?i.value=d:null),multiple:"",placeholder:"Upload your documents",label:"File input","prepend-inner-icon":"bx-paperclip"},{selection:n(({fileNames:d})=>[(c(!0),S(N,null,L(d,f=>(c(),s(k,{key:f,label:"",size:"small",color:"primary",class:"me-2"},{default:n(()=>[t(U(f),1)]),_:2},1024))),128))]),_:1},8,["modelValue"])}}}),M=F({__name:"DemoFileInputValidation",setup(u){const i=[o=>!o||!o.length||o[0].size<1e6||"Avatar size should be less than 1 MB!"];return(o,_)=>{const p=r;return c(),s(p,{rules:i,label:"Avatar",accept:"image/png, image/jpeg, image/bmp",placeholder:"Pick an avatar","prepend-inner-icon":"bx-camera",variant:"outlined"})}}}),T={};function O(u,i){const o=r;return c(),s(o,{"show-size":"",label:"File input"})}const Y=m(T,[["render",O]]),E={};function K(u,i){const o=r;return c(),s(o,{label:"File input","prepend-icon":"bx-camera"})}const W=m(E,[["render",K]]),q={};function G(u,i){const o=r;return c(),s(o,{multiple:"",label:"File input"})}const H=m(q,[["render",G]]),J={};function Q(u,i){const o=r;return c(),s(o,{"show-size":"",counter:"",multiple:"",label:"File input"})}const X=m(J,[["render",Q]]),Z={};function ee(u,i){const o=r;return c(),s(o,{chips:"",label:"File input w/ chips"})}const te=m(Z,[["render",ee]]),le={};function ne(u,i){const o=r;return c(),s(o,{accept:"image/*",label:"File input"})}const oe=m(le,[["render",ne]]),ie={};function pe(u,i){return c(),s(V,null,{default:n(()=>[e(a,{cols:"12",sm:"6"},{default:n(()=>[e(h,{label:"Outlined"})]),_:1}),e(a,{cols:"12",sm:"6"},{default:n(()=>[e(h,{label:"Filled",variant:"filled"})]),_:1}),e(a,{cols:"12",sm:"6"},{default:n(()=>[e(h,{label:"Solo",variant:"solo"})]),_:1}),e(a,{cols:"12",sm:"6"},{default:n(()=>[e(h,{label:"Plain",variant:"plain"})]),_:1}),e(a,{cols:"12",sm:"6"},{default:n(()=>[e(h,{label:"Underlined",variant:"underlined",density:"default"})]),_:1})]),_:1})}const ae=m(ie,[["render",pe]]),ce={};function se(u,i){const o=r;return c(),s(o,{label:"File input",density:"compact"})}const ue=m(ce,[["render",se]]),re={};function me(u,i){const o=r;return c(),s(o,{label:"File input"})}const de=m(re,[["render",me]]),_e={ts:`<template>
  <AppFileInput
    accept="image/*"
    label="File input"
  />
</template>
`,js:`<template>
  <AppFileInput
    accept="image/*"
    label="File input"
  />
</template>
`},fe={ts:`<template>
  <AppFileInput label="File input" />
</template>
`,js:`<template>
  <AppFileInput label="File input" />
</template>
`},he={ts:`<template>
  <AppFileInput
    chips
    label="File input w/ chips"
  />
</template>
`,js:`<template>
  <AppFileInput
    chips
    label="File input w/ chips"
  />
</template>
`},Fe={ts:`<template>
  <AppFileInput
    show-size
    counter
    multiple
    label="File input"
  />
</template>
`,js:`<template>
  <AppFileInput
    show-size
    counter
    multiple
    label="File input"
  />
</template>
`},be={ts:`<template>
  <AppFileInput
    label="File input"
    density="compact"
  />
</template>
`,js:`<template>
  <AppFileInput
    label="File input"
    density="compact"
  />
</template>
`},ge={ts:`<script setup lang="ts">
const file = ref()
const loading = ref(true)

watch(file, () => {
  loading.value = !file.value[0]
})
<\/script>

<template>
  <AppFileInput
    v-model="file"
    :loading="loading"
    color="primary"
    label="File input"
    variant="outlined"
  />
</template>
`,js:`<script setup>
const file = ref()
const loading = ref(true)

watch(file, () => {
  loading.value = !file.value[0]
})
<\/script>

<template>
  <AppFileInput
    v-model="file"
    :loading="loading"
    color="primary"
    label="File input"
    variant="outlined"
  />
</template>
`},Ie={ts:`<template>
  <AppFileInput
    multiple
    label="File input"
  />
</template>
`,js:`<template>
  <AppFileInput
    multiple
    label="File input"
  />
</template>
`},Ve={ts:`<template>
  <AppFileInput
    label="File input"
    prepend-icon="bx-camera"
  />
</template>
`,js:`<template>
  <AppFileInput
    label="File input"
    prepend-icon="bx-camera"
  />
</template>
`},ve={ts:`<script lang="ts" setup>
const files = ref<File[]>([])
<\/script>

<template>
  <AppFileInput
    v-model="files"
    multiple
    placeholder="Upload your documents"
    label="File input"
    prepend-inner-icon="bx-paperclip"
  >
    <template #selection="{ fileNames }">
      <template
        v-for="fileName in fileNames"
        :key="fileName"
      >
        <VChip
          label
          size="small"
          color="primary"
          class="me-2"
        >
          {{ fileName }}
        </VChip>
      </template>
    </template>
  </AppFileInput>
</template>
`,js:`<script setup>
const files = ref([])
<\/script>

<template>
  <AppFileInput
    v-model="files"
    multiple
    placeholder="Upload your documents"
    label="File input"
    prepend-inner-icon="bx-paperclip"
  >
    <template #selection="{ fileNames }">
      <template
        v-for="fileName in fileNames"
        :key="fileName"
      >
        <VChip
          label
          size="small"
          color="primary"
          class="me-2"
        >
          {{ fileName }}
        </VChip>
      </template>
    </template>
  </AppFileInput>
</template>
`},Ae={ts:`<template>
  <AppFileInput
    show-size
    label="File input"
  />
</template>
`,js:`<template>
  <AppFileInput
    show-size
    label="File input"
  />
</template>
`},ye={ts:`<script lang="ts" setup>
const rules = [
  (fileList: FileList) => !fileList || !fileList.length || fileList[0].size < 1000000 || 'Avatar size should be less than 1 MB!',
]
<\/script>

<template>
  <AppFileInput
    :rules="rules"
    label="Avatar"
    accept="image/png, image/jpeg, image/bmp"
    placeholder="Pick an avatar"
    prepend-inner-icon="bx-camera"
    variant="outlined"
  />
</template>
`,js:`<script setup>
const rules = [fileList => !fileList || !fileList.length || fileList[0].size < 1000000 || 'Avatar size should be less than 1 MB!']
<\/script>

<template>
  <AppFileInput
    :rules="rules"
    label="Avatar"
    accept="image/png, image/jpeg, image/bmp"
    placeholder="Pick an avatar"
    prepend-inner-icon="bx-camera"
    variant="outlined"
  />
</template>
`},Ce={ts:`<template>
  <VRow>
    <VCol
      cols="12"
      sm="6"
    >
      <VFileInput label="Outlined" />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VFileInput
        label="Filled"
        variant="filled"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VFileInput
        label="Solo"
        variant="solo"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VFileInput
        label="Plain"
        variant="plain"
      />
    </VCol>
    <VCol
      cols="12"
      sm="6"
    >
      <VFileInput
        label="Underlined"
        variant="underlined"
        density="default"
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
      <VFileInput label="Outlined" />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VFileInput
        label="Filled"
        variant="filled"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VFileInput
        label="Solo"
        variant="solo"
      />
    </VCol>

    <VCol
      cols="12"
      sm="6"
    >
      <VFileInput
        label="Plain"
        variant="plain"
      />
    </VCol>
    <VCol
      cols="12"
      sm="6"
    >
      <VFileInput
        label="Underlined"
        variant="underlined"
        density="default"
      />
    </VCol>
  </VRow>
</template>
`},we=l("p",null,[t("The "),l("code",null,"v-file-input"),t(" component is used to selecting files.")],-1),xe=l("p",null,[t("You can reduces the file input height with "),l("code",null,"density"),t(" prop. Available options are: "),l("code",null,"default"),t(", "),l("code",null,"comfortable"),t(", and "),l("code",null,"compact"),t(".")],-1),ze=l("p",null,[t("use "),l("code",null,"solo"),t(", "),l("code",null,"filled"),t(", "),l("code",null,"outlined"),t(", "),l("code",null,"plain"),t(" and "),l("code",null,"underlined"),t(" option of "),l("code",null,"variant"),t(" prop to change the look of file input.")],-1),$e=l("p",null,[l("code",null,"v-file-input"),t(" component can accept only specific media formats/file types if you want.")],-1),De=l("p",null,[t("Use "),l("code",null,"chip"),t(" prop to display the selected file as a chip.")],-1),je=l("p",null,[t("When using the "),l("code",null,"show-size"),t(" property along with "),l("code",null,"counter"),t(", the total number of files and size will be displayed under the input.")],-1),Se=l("p",null,[t(" The "),l("code",null,"v-file-input"),t(" can contain multiple files at the same time when using the "),l("code",null,"multiple"),t(" prop. ")],-1),Ne=l("p",null,[t(" The "),l("code",null,"v-file-input"),t(" has a default "),l("code",null,"prepend-icon"),t(" that can be set on the component or adjusted globally. ")],-1),Le=l("p",null,[t("The displayed size of the selected file(s) can be configured with the "),l("code",null,"show-size"),t(" property.")],-1),Ue=l("p",null,[t("You can use the "),l("code",null,"rules"),t(" prop to create your own custom validation parameters.")],-1),ke=l("p",null,[t("Using the "),l("code",null,"selection"),t(" slot, you can customize the appearance of your input selections.")],-1),Be=l("p",null,[t("Use "),l("code",null,"loading"),t(" prop to displays linear progress bar.")],-1),ot=F({__name:"file-input",setup(u){return(i,o)=>{const _=de,p=B,d=ue,f=ae,v=oe,A=te,y=X,C=H,w=W,x=Y,z=M,$=R,D=P;return c(),s(V,{class:"match-height"},{default:n(()=>[e(a,{cols:"12",md:"6"},{default:n(()=>[e(p,{title:"Basic",code:fe},{default:n(()=>[we,e(_)]),_:1},8,["code"])]),_:1}),e(a,{cols:"12",md:"6"},{default:n(()=>[e(p,{title:"Density",code:be},{default:n(()=>[xe,e(d)]),_:1},8,["code"])]),_:1}),e(a,{cols:"12"},{default:n(()=>[e(p,{title:"Variant",code:Ce},{default:n(()=>[ze,e(f)]),_:1},8,["code"])]),_:1}),e(a,{cols:"12",md:"6"},{default:n(()=>[e(p,{title:"Accept",code:_e},{default:n(()=>[$e,e(v)]),_:1},8,["code"])]),_:1}),e(a,{cols:"12",md:"6"},{default:n(()=>[e(p,{title:"Chips",code:he},{default:n(()=>[De,e(A)]),_:1},8,["code"])]),_:1}),e(a,{cols:"12",md:"6"},{default:n(()=>[e(p,{title:"Counter",code:Fe},{default:n(()=>[je,e(y)]),_:1},8,["code"])]),_:1}),e(a,{cols:"12",md:"6"},{default:n(()=>[e(p,{title:"Multiple",code:Ie},{default:n(()=>[Se,e(C)]),_:1},8,["code"])]),_:1}),e(a,{cols:"12",md:"6"},{default:n(()=>[e(p,{title:"Prepend icon",code:Ve},{default:n(()=>[Ne,e(w)]),_:1},8,["code"])]),_:1}),e(a,{cols:"12",md:"6"},{default:n(()=>[e(p,{title:"Show size",code:Ae},{default:n(()=>[Le,e(x)]),_:1},8,["code"])]),_:1}),e(a,{cols:"12",md:"6"},{default:n(()=>[e(p,{title:"Validation",code:ye},{default:n(()=>[Ue,e(z)]),_:1},8,["code"])]),_:1}),e(a,{cols:"12",md:"6"},{default:n(()=>[e(p,{title:"Selection slot",code:ve},{default:n(()=>[ke,e($)]),_:1},8,["code"])]),_:1}),e(a,{cols:"12",md:"6"},{default:n(()=>[e(p,{title:"Loading",code:ge},{default:n(()=>[Be,e(D)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{ot as default};
