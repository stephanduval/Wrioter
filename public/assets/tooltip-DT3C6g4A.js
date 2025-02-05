import{d as m,o as s,c as _,b as o,f as t,t as n,ag as e,n as V,an as b,a2 as T,q as f,e as a,K as v,r as $,g as B}from"./main-Ca4qx7y-.js";import{V as i}from"./VTooltip-DaUsn1KG.js";import{V as S}from"./VImg-C3GobFkp.js";import{V as H}from"./VAvatar-B3k1LwfD.js";import{_ as D}from"./AppCardCode.vue_vue_type_style_index_0_lang-Bq5KC9kd.js";import{a as d,V as k}from"./VRow-EsZ_8CZn.js";import"./VOverlay-C-c1GQAd.js";import"./easing-CjukEv2V.js";import"./delay-DDujfhaz.js";import"./lazy-He9qliih.js";import"./scopeId-B0kCZn--.js";import"./forwardRefs-C-GTDzx5.js";import"./vue3-perfect-scrollbar.esm-CLCcbP0n.js";import"./VCard-k3dQT3Up.js";import"./VCardText-iX3erHMv.js";import"./VDivider-CMgOCZ_h.js";/* empty css              */const E={class:"demo-space-x"},I=a("span",null,"Tooltip on Icon",-1),A=m({__name:"DemoTooltipTooltipOnVariousElements",setup(r){return(l,u)=>(s(),_("div",E,[o(e,null,{default:t(()=>[n(" Button "),o(i,{location:"top",activator:"parent"},{default:t(()=>[n(" Tooltip ")]),_:1})]),_:1}),o(H,{color:"info"},{default:t(()=>[o(S,{src:V(b)},null,8,["src"]),o(i,{location:"top",activator:"parent"},{default:t(()=>[n(" Tooltip on Avatar ")]),_:1})]),_:1}),o(i,{location:"top"},{activator:t(({props:c})=>[o(T,f(c,{size:"30",icon:"bx-user"}),null,16)]),default:t(()=>[I]),_:1})]))}}),w={},j={class:"demo-space-x"},C=a("span",null,"Scale Transition",-1),F=a("span",null,"Scroll X Transition",-1),X=a("span",null,"Scroll Y Transition",-1);function M(r,l){return s(),_("div",j,[o(e,null,{default:t(()=>[n(" scale transition "),o(i,{location:"top",transition:"scale-transition",activator:"parent"},{default:t(()=>[C]),_:1})]),_:1}),o(e,null,{default:t(()=>[n(" scroll X transition "),o(i,{location:"top",activator:"parent",transition:"scroll-x-transition"},{default:t(()=>[F]),_:1})]),_:1}),o(e,null,{default:t(()=>[n(" scroll y transition "),o(i,{location:"top",activator:"parent",transition:"scroll-y-transition"},{default:t(()=>[X]),_:1})]),_:1})])}const P=v(w,[["render",M]]),z={class:"demo-space-x"},N=a("span",null,"Programmatic tooltip",-1),Y=m({__name:"DemoTooltipVModelSupport",setup(r){const l=$(!1);return(u,c)=>(s(),_("div",z,[o(e,{onClick:c[0]||(c[0]=p=>l.value=!V(l))},{default:t(()=>[n(" toggle tooltip ")]),_:1}),o(i,{"model-value":V(l),location:"top"},{activator:t(({props:p})=>[o(T,f(p,{icon:"bx-bxl-instagram"}),null,16)]),default:t(()=>[N]),_:1},8,["model-value"])]))}}),L={},U=a("span",null,"Open Delay On Hover",-1),q=a("span",null,"Open Delay On Hover",-1);function K(r,l){return s(),B(e,{variant:"outlined"},{default:t(()=>[U,n(),o(i,{"open-delay":"500",location:"top",activator:"parent"},{default:t(()=>[q]),_:1})]),_:1})}const R=v(L,[["render",K]]),G={},J={class:"demo-space-x"},Q=a("span",null,"Open On Hover",-1),W=a("span",null,"Open On click",-1),Z=a("span",null,"Open On Hover + Focus",-1);function oo(r,l){return s(),_("div",J,[o(e,{variant:"outlined"},{default:t(()=>[Q,o(i,{activator:"parent",location:"top"},{default:t(()=>[n(" Open On Hover ")]),_:1})]),_:1}),o(e,{variant:"outlined",color:"primary"},{default:t(()=>[W,o(i,{"open-on-click":"","open-on-hover":!1,location:"top",activator:"parent"},{default:t(()=>[n(" Open On click ")]),_:1})]),_:1}),o(e,{variant:"outlined"},{default:t(()=>[Z,o(i,{"open-on-focus":"",location:"top",activator:"parent"},{default:t(()=>[n(" Open On Hover + Focus ")]),_:1})]),_:1})])}const to=v(G,[["render",oo]]),no={},ao={class:"demo-space-x"};function io(r,l){return s(),_("div",ao,[o(e,{variant:"tonal"},{default:t(()=>[n(" Tooltip on End "),o(i,{activator:"parent",location:"end"},{default:t(()=>[n(" End Tooltip ")]),_:1})]),_:1}),o(e,{variant:"tonal"},{default:t(()=>[n(" Tooltip on Start "),o(i,{activator:"parent",location:"start"},{default:t(()=>[n(" Start Tooltip ")]),_:1})]),_:1}),o(e,{variant:"tonal"},{default:t(()=>[n(" Tooltip on Top "),o(i,{activator:"parent",location:"top"},{default:t(()=>[n(" Top Tooltip ")]),_:1})]),_:1}),o(e,{variant:"tonal"},{default:t(()=>[n(" Tooltip on Bottom "),o(i,{activator:"parent",location:"bottom"},{default:t(()=>[n(" Bottom Tooltip ")]),_:1})]),_:1})])}const eo=v(no,[["render",io]]),lo={ts:`<template>
  <!-- Delay on open -->
  <VBtn variant="outlined">
    <span>Open Delay On Hover</span> <VTooltip
      open-delay="500"
      location="top"
      activator="parent"
    >
      <span>Open Delay On Hover</span>
    </VTooltip>
  </VBtn>
</template>
`,js:`<template>
  <!-- Delay on open -->
  <VBtn variant="outlined">
    <span>Open Delay On Hover</span> <VTooltip
      open-delay="500"
      location="top"
      activator="parent"
    >
      <span>Open Delay On Hover</span>
    </VTooltip>
  </VBtn>
</template>
`},po={ts:`<template>
  <div class="demo-space-x">
    <!-- open on hover -->
    <VBtn variant="outlined">
      <span>Open On Hover</span>
      <VTooltip
        activator="parent"
        location="top"
      >
        Open On Hover
      </VTooltip>
    </VBtn>

    <!-- open on click -->
    <VBtn
      variant="outlined"
      color="primary"
    >
      <span>Open On click</span>

      <VTooltip
        open-on-click
        :open-on-hover="false"
        location="top"
        activator="parent"
      >
        Open On click
      </VTooltip>
    </VBtn>

    <!-- open on focus -->
    <VBtn variant="outlined">
      <span>Open On Hover + Focus</span>
      <VTooltip
        open-on-focus
        location="top"
        activator="parent"
      >
        Open On Hover + Focus
      </VTooltip>
    </VBtn>
  </div>
</template>
`,js:`<template>
  <div class="demo-space-x">
    <!-- open on hover -->
    <VBtn variant="outlined">
      <span>Open On Hover</span>
      <VTooltip
        activator="parent"
        location="top"
      >
        Open On Hover
      </VTooltip>
    </VBtn>

    <!-- open on click -->
    <VBtn
      variant="outlined"
      color="primary"
    >
      <span>Open On click</span>

      <VTooltip
        open-on-click
        :open-on-hover="false"
        location="top"
        activator="parent"
      >
        Open On click
      </VTooltip>
    </VBtn>

    <!-- open on focus -->
    <VBtn variant="outlined">
      <span>Open On Hover + Focus</span>
      <VTooltip
        open-on-focus
        location="top"
        activator="parent"
      >
        Open On Hover + Focus
      </VTooltip>
    </VBtn>
  </div>
</template>
`},so={ts:`<template>
  <div class="demo-space-x">
    <VBtn variant="tonal">
      Tooltip on End
      <VTooltip
        activator="parent"
        location="end"
      >
        End Tooltip
      </VTooltip>
    </VBtn>

    <VBtn variant="tonal">
      Tooltip on Start
      <VTooltip
        activator="parent"
        location="start"
      >
        Start Tooltip
      </VTooltip>
    </VBtn>

    <VBtn variant="tonal">
      Tooltip on Top
      <VTooltip
        activator="parent"
        location="top"
      >
        Top Tooltip
      </VTooltip>
    </VBtn>

    <VBtn variant="tonal">
      Tooltip on Bottom
      <VTooltip
        activator="parent"
        location="bottom"
      >
        Bottom Tooltip
      </VTooltip>
    </VBtn>
  </div>
</template>
`,js:`<template>
  <div class="demo-space-x">
    <VBtn variant="tonal">
      Tooltip on End
      <VTooltip
        activator="parent"
        location="end"
      >
        End Tooltip
      </VTooltip>
    </VBtn>

    <VBtn variant="tonal">
      Tooltip on Start
      <VTooltip
        activator="parent"
        location="start"
      >
        Start Tooltip
      </VTooltip>
    </VBtn>

    <VBtn variant="tonal">
      Tooltip on Top
      <VTooltip
        activator="parent"
        location="top"
      >
        Top Tooltip
      </VTooltip>
    </VBtn>

    <VBtn variant="tonal">
      Tooltip on Bottom
      <VTooltip
        activator="parent"
        location="bottom"
      >
        Bottom Tooltip
      </VTooltip>
    </VBtn>
  </div>
</template>
`},ro={ts:`<script setup lang="ts">
import avatar4 from '@images/avatars/avatar-4.png'
<\/script>

<template>
  <div class="demo-space-x">
    <VBtn>
      Button
      <VTooltip
        location="top"
        activator="parent"
      >
        Tooltip
      </VTooltip>
    </VBtn>

    <VAvatar color="info">
      <VImg :src="avatar4" />
      <VTooltip
        location="top"
        activator="parent"
      >
        Tooltip on Avatar
      </VTooltip>
    </VAvatar>

    <VTooltip location="top">
      <template #activator="{ props }">
        <VIcon
          v-bind="props"
          size="30"
          icon="bx-user"
        />
      </template>
      <span>Tooltip on Icon</span>
    </VTooltip>
  </div>
</template>
`,js:`<script setup>
import avatar4 from '@images/avatars/avatar-4.png'
<\/script>

<template>
  <div class="demo-space-x">
    <VBtn>
      Button
      <VTooltip
        location="top"
        activator="parent"
      >
        Tooltip
      </VTooltip>
    </VBtn>

    <VAvatar color="info">
      <VImg :src="avatar4" />
      <VTooltip
        location="top"
        activator="parent"
      >
        Tooltip on Avatar
      </VTooltip>
    </VAvatar>

    <VTooltip location="top">
      <template #activator="{ props }">
        <VIcon
          v-bind="props"
          size="30"
          icon="bx-user"
        />
      </template>
      <span>Tooltip on Icon</span>
    </VTooltip>
  </div>
</template>
`},co={ts:`<template>
  <div class="demo-space-x">
    <!-- Scale transition -->
    <VBtn>
      scale transition
      <VTooltip
        location="top"
        transition="scale-transition"
        activator="parent"
      >
        <span>Scale Transition</span>
      </VTooltip>
    </VBtn>

    <!-- Scroll x transition -->
    <VBtn>
      scroll X transition
      <VTooltip
        location="top"
        activator="parent"
        transition="scroll-x-transition"
      >
        <span>Scroll X Transition</span>
      </VTooltip>
    </VBtn>

    <!-- Scroll y transition -->
    <VBtn>
      scroll y transition
      <VTooltip
        location="top"
        activator="parent"
        transition="scroll-y-transition"
      >
        <span>Scroll Y Transition</span>
      </VTooltip>
    </VBtn>
  </div>
</template>
`,js:`<template>
  <div class="demo-space-x">
    <!-- Scale transition -->
    <VBtn>
      scale transition
      <VTooltip
        location="top"
        transition="scale-transition"
        activator="parent"
      >
        <span>Scale Transition</span>
      </VTooltip>
    </VBtn>

    <!-- Scroll x transition -->
    <VBtn>
      scroll X transition
      <VTooltip
        location="top"
        activator="parent"
        transition="scroll-x-transition"
      >
        <span>Scroll X Transition</span>
      </VTooltip>
    </VBtn>

    <!-- Scroll y transition -->
    <VBtn>
      scroll y transition
      <VTooltip
        location="top"
        activator="parent"
        transition="scroll-y-transition"
      >
        <span>Scroll Y Transition</span>
      </VTooltip>
    </VBtn>
  </div>
</template>
`},_o={ts:`<script lang="ts" setup>
const isTooltipVisible = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <VBtn @click="isTooltipVisible = !isTooltipVisible">
      toggle tooltip
    </VBtn>

    <VTooltip
      :model-value="isTooltipVisible"
      location="top"
    >
      <template #activator="{ props }">
        <VIcon
          v-bind="props"
          icon="bx-bxl-instagram"
        />
      </template>
      <span>Programmatic tooltip</span>
    </VTooltip>
  </div>
</template>
`,js:`<script setup>
const isTooltipVisible = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <VBtn @click="isTooltipVisible = !isTooltipVisible">
      toggle tooltip
    </VBtn>

    <VTooltip
      :model-value="isTooltipVisible"
      location="top"
    >
      <template #activator="{ props }">
        <VIcon
          v-bind="props"
          icon="bx-bxl-instagram"
        />
      </template>
      <span>Programmatic tooltip</span>
    </VTooltip>
  </div>
</template>
`},vo=a("p",null,[n("Use the "),a("code",null,"location"),n(" prop to specify on which side of the element the tooltip should show")],-1),Vo=a("p",null,[n("Delay (in ms) after which tooltip opens (when "),a("code",null,"open-on-hover"),n(" prop is set to true)")],-1),mo=a("p",null,[n("Tooltip visibility can be programmatically changed using "),a("code",null,"v-model"),n(".")],-1),uo=a("p",null,[n("Use "),a("code",null,"transition"),n(" prop to sets the component transition.")],-1),To=a("p",null,"Tooltips can wrap any element.",-1),jo=m({__name:"tooltip",setup(r){return(l,u)=>{const c=eo,p=D,O=to,h=R,x=Y,g=P,y=A;return s(),B(k,null,{default:t(()=>[o(d,{cols:"12"},{default:t(()=>[o(p,{title:"Location",code:so},{default:t(()=>[vo,o(c)]),_:1},8,["code"])]),_:1}),o(d,{cols:"12"},{default:t(()=>[o(p,{title:"Events",code:po},{default:t(()=>[o(O)]),_:1},8,["code"])]),_:1}),o(d,{cols:"12"},{default:t(()=>[o(p,{title:"Delay On Hover",code:lo},{default:t(()=>[Vo,o(h)]),_:1},8,["code"])]),_:1}),o(d,{cols:"12"},{default:t(()=>[o(p,{title:"V-Model Support",code:_o},{default:t(()=>[mo,o(x)]),_:1},8,["code"])]),_:1}),o(d,{cols:"12"},{default:t(()=>[o(p,{title:"Transition",code:co},{default:t(()=>[uo,o(g)]),_:1},8,["code"])]),_:1}),o(d,{cols:"12"},{default:t(()=>[o(p,{title:"Tooltip on Various Elements",code:ro},{default:t(()=>[To,o(y)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{jo as default};
