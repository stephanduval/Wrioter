import{u as m,S as f,P as k,U as b,E as v}from"./index-DJ1wiDzC.js";import{T as C}from"./index-C2zTTMST.js";import{V as a}from"./VChip-DPeYBiGA.js";import{V as y}from"./VDivider-BaT1F8ur.js";import{d as p,o as c,c as s,n as o,b as t,f as r,t as n,y as V,r as x,ah as A,g as B}from"./main-COzPSvmz.js";import{_ as w}from"./AppCardCode.vue_vue_type_style_index_0_lang-CHcTsrkT.js";import{_ as E}from"./TiptapEditor.vue_vue_type_style_index_0_lang-B5Y_n5bS.js";import{a as g,V as H}from"./VRow-BJ3vRaQf.js";import"./VSlideGroup-S6brIomR.js";import"./VAvatar-BgzCTEhE.js";import"./VImg-Mm9y2cRD.js";import"./vue3-perfect-scrollbar.esm-DhWXpBVy.js";import"./VCard-n1X1cK2l.js";import"./VCardText-Cwvv1NXL.js";/* empty css              */const $={class:"border pa-2 rounded custom-editor"},I={key:0,class:"d-flex flex-wrap gap-x-4 gap-y-2 mb-2"},_=p({__name:"DemoEditorCustomEditor",setup(u){const e=m({content:`
        <h2>
          Hi there,
        </h2>
        <p>
          this is a <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you'd probably expect from a text editor. But wait until you see the lists:
        </p>
        <ul>
          <li>
            That's a bullet list with one …
          </li>
          <li>
            … or two list items.
          </li>
        </ul>
        <p>
          Isn't that great? And all of that is editable. But wait, there's more. Let's try a code block:
        </p>
        <pre><code class="language-css">body {
  display: none;
}</code></pre>
        <p>
          I know, I know, this is impressive. It's only the tip of the iceberg though. Give it a try and click a little bit around. Don't forget to check the other examples too.
        </p>
        <blockquote>
          Wow, that's amazing. Good work, boy! 👏
          <br />
          — Mom
        </blockquote>
      `,extensions:[f,C.configure({types:["heading","paragraph"]}),k.configure({placeholder:"Write something here..."}),b]});return(h,i)=>(c(),s("div",$,[o(e)?(c(),s("div",I,[t(a,{disabled:!o(e).can().chain().focus().toggleBold().run(),color:o(e).isActive("bold")?"primary":"",onClick:i[0]||(i[0]=l=>o(e).chain().focus().toggleBold().run())},{default:r(()=>[n(" bold ")]),_:1},8,["disabled","color"]),t(a,{disabled:!o(e).can().chain().focus().toggleItalic().run(),color:o(e).isActive("italic")?"primary":"",onClick:i[1]||(i[1]=l=>o(e).chain().focus().toggleItalic().run())},{default:r(()=>[n(" italic ")]),_:1},8,["disabled","color"]),t(a,{disabled:!o(e).can().chain().focus().toggleStrike().run(),color:o(e).isActive("strike")?"primary":"",onClick:i[2]||(i[2]=l=>o(e).chain().focus().toggleStrike().run())},{default:r(()=>[n(" strike ")]),_:1},8,["disabled","color"]),t(a,{disabled:!o(e).can().chain().focus().toggleCode().run(),color:o(e).isActive("code")?"primary":"",onClick:i[3]||(i[3]=l=>o(e).chain().focus().toggleCode().run())},{default:r(()=>[n(" code ")]),_:1},8,["disabled","color"]),t(a,{onClick:i[4]||(i[4]=l=>o(e).chain().focus().unsetAllMarks().run())},{default:r(()=>[n(" clear marks ")]),_:1}),t(a,{onClick:i[5]||(i[5]=l=>o(e).chain().focus().clearNodes().run())},{default:r(()=>[n(" clear nodes ")]),_:1}),t(a,{color:o(e).isActive("paragraph")?"primary":"",onClick:i[6]||(i[6]=l=>o(e).chain().focus().setParagraph().run())},{default:r(()=>[n(" paragraph ")]),_:1},8,["color"]),t(a,{color:o(e).isActive("heading",{level:1})?"primary":"",onClick:i[7]||(i[7]=l=>o(e).chain().focus().toggleHeading({level:1}).run())},{default:r(()=>[n(" h1 ")]),_:1},8,["color"]),t(a,{color:o(e).isActive("heading",{level:2})?"primary":"",onClick:i[8]||(i[8]=l=>o(e).chain().focus().toggleHeading({level:2}).run())},{default:r(()=>[n(" h2 ")]),_:1},8,["color"]),t(a,{color:o(e).isActive("heading",{level:3})?"primary":"",onClick:i[9]||(i[9]=l=>o(e).chain().focus().toggleHeading({level:3}).run())},{default:r(()=>[n(" h3 ")]),_:1},8,["color"]),t(a,{color:o(e).isActive("heading",{level:4})?"primary":"",onClick:i[10]||(i[10]=l=>o(e).chain().focus().toggleHeading({level:4}).run())},{default:r(()=>[n(" h4 ")]),_:1},8,["color"]),t(a,{color:o(e).isActive("heading",{level:5})?"primary":"",onClick:i[11]||(i[11]=l=>o(e).chain().focus().toggleHeading({level:5}).run())},{default:r(()=>[n(" h5 ")]),_:1},8,["color"]),t(a,{color:o(e).isActive("heading",{level:6})?"primary":"",onClick:i[12]||(i[12]=l=>o(e).chain().focus().toggleHeading({level:6}).run())},{default:r(()=>[n(" h6 ")]),_:1},8,["color"]),t(a,{color:o(e).isActive("bulletList")?"primary":"",onClick:i[13]||(i[13]=l=>o(e).chain().focus().toggleBulletList().run())},{default:r(()=>[n(" bullet list ")]),_:1},8,["color"]),t(a,{color:o(e).isActive("orderedList")?"primary":"",onClick:i[14]||(i[14]=l=>o(e).chain().focus().toggleOrderedList().run())},{default:r(()=>[n(" ordered list ")]),_:1},8,["color"]),t(a,{color:o(e).isActive("codeBlock")?"primary":"",onClick:i[15]||(i[15]=l=>o(e).chain().focus().toggleCodeBlock().run())},{default:r(()=>[n(" code block ")]),_:1},8,["color"]),t(a,{color:o(e).isActive("blockquote")?"primary":"",onClick:i[16]||(i[16]=l=>o(e).chain().focus().toggleBlockquote().run())},{default:r(()=>[n(" blockquote ")]),_:1},8,["color"]),t(a,{onClick:i[17]||(i[17]=l=>o(e).chain().focus().setHorizontalRule().run())},{default:r(()=>[n(" horizontal rule ")]),_:1}),t(a,{onClick:i[18]||(i[18]=l=>o(e).chain().focus().setHardBreak().run())},{default:r(()=>[n(" hard break ")]),_:1}),t(a,{disabled:!o(e).can().chain().focus().undo().run(),onClick:i[19]||(i[19]=l=>o(e).chain().focus().undo().run())},{default:r(()=>[n(" undo ")]),_:1},8,["disabled"]),t(a,{disabled:!o(e).can().chain().focus().redo().run(),onClick:i[20]||(i[20]=l=>o(e).chain().focus().redo().run())},{default:r(()=>[n(" redo ")]),_:1},8,["disabled"])])):V("",!0),t(y,{class:"my-4"}),t(o(v),{editor:o(e)},null,8,["editor"])]))}}),T=p({__name:"DemoEditorBasicEditor",setup(u){const e=x(`
<p>
  This is a radically reduced version of tiptap. It has support for a document, with paragraphs and text. That's it. It's probably too much for real minimalists though.
</p>
<p>
  The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.  
</p>
`);return(h,i)=>{const l=E;return c(),s("div",null,[t(l,{modelValue:o(e),"onUpdate:modelValue":i[0]||(i[0]=d=>A(e)?e.value=d:null),class:"border rounded basic-editor"},null,8,["modelValue"])])}}}),q={ts:`<script setup lang="ts">
const basicEditorContent = ref(\`
<p>
  This is a radically reduced version of tiptap. It has support for a document, with paragraphs and text. That's it. It's probably too much for real minimalists though.
</p>
<p>
  The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.  
</p>
\`)
<\/script>

<template>
  <div>
    <TiptapEditor
      v-model="basicEditorContent"
      class="border rounded basic-editor"
    />
  </div>
</template>

<style lang="scss">
.basic-editor {
  .ProseMirror {
    block-size: 200px;
    outline: none;
    overflow-y: auto;
    padding-inline: 0.5rem;
  }
}
</style>
`,js:`<script setup>
const basicEditorContent = ref(\`
<p>
  This is a radically reduced version of tiptap. It has support for a document, with paragraphs and text. That's it. It's probably too much for real minimalists though.
</p>
<p>
  The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.  
</p>
\`)
<\/script>

<template>
  <div>
    <TiptapEditor
      v-model="basicEditorContent"
      class="border rounded basic-editor"
    />
  </div>
</template>

<style lang="scss">
.basic-editor {
  .ProseMirror {
    block-size: 200px;
    outline: none;
    overflow-y: auto;
    padding-inline: 0.5rem;
  }
}
</style>
`},S={ts:`<script setup lang="ts">
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { StarterKit } from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'

const editor = useEditor({
  content: \`
        <h2>
          Hi there,
        </h2>
        <p>
          this is a <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you'd probably expect from a text editor. But wait until you see the lists:
        </p>
        <ul>
          <li>
            That's a bullet list with one …
          </li>
          <li>
            … or two list items.
          </li>
        </ul>
        <p>
          Isn't that great? And all of that is editable. But wait, there's more. Let's try a code block:
        </p>
        <pre><code class="language-css">body {
  display: none;
}</code></pre>
        <p>
          I know, I know, this is impressive. It's only the tip of the iceberg though. Give it a try and click a little bit around. Don't forget to check the other examples too.
        </p>
        <blockquote>
          Wow, that's amazing. Good work, boy! 👏
          <br />
          — Mom
        </blockquote>
      \`,
  extensions: [
    StarterKit,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Placeholder.configure({
      placeholder: 'Write something here...',
    }),
    Underline,
  ],
})
<\/script>

<template>
  <div class="border pa-2 rounded custom-editor">
    <div
      v-if="editor"
      class="d-flex flex-wrap gap-x-4 gap-y-2 mb-2"
    >
      <VChip
        :disabled="!editor.can().chain().focus().toggleBold().run()"
        :color="editor.isActive('bold') ? 'primary' : ''"
        @click="editor.chain().focus().toggleBold().run()"
      >
        bold
      </VChip>

      <VChip
        :disabled="!editor.can().chain().focus().toggleItalic().run()"
        :color="editor.isActive('italic') ? 'primary' : ''"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        italic
      </VChip>

      <VChip
        :disabled="!editor.can().chain().focus().toggleStrike().run()"
        :color="editor.isActive('strike') ? 'primary' : ''"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        strike
      </VChip>

      <VChip
        :disabled="!editor.can().chain().focus().toggleCode().run()"
        :color="editor.isActive('code') ? 'primary' : ''"
        @click="editor.chain().focus().toggleCode().run()"
      >
        code
      </VChip>

      <VChip @click="editor.chain().focus().unsetAllMarks().run()">
        clear marks
      </VChip>

      <VChip @click="editor.chain().focus().clearNodes().run()">
        clear nodes
      </VChip>

      <VChip
        :color="editor.isActive('paragraph') ? 'primary' : ''"
        @click="editor.chain().focus().setParagraph().run()"
      >
        paragraph
      </VChip>

      <VChip
        :color="editor.isActive('heading', { level: 1 }) ? 'primary' : ''"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        h1
      </VChip>

      <VChip
        :color="editor.isActive('heading', { level: 2 }) ? 'primary' : ''"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        h2
      </VChip>

      <VChip
        :color="editor.isActive('heading', { level: 3 }) ? 'primary' : ''"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        h3
      </VChip>

      <VChip
        :color="editor.isActive('heading', { level: 4 }) ? 'primary' : ''"
        @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
      >
        h4
      </VChip>

      <VChip
        :color="editor.isActive('heading', { level: 5 }) ? 'primary' : ''"
        @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
      >
        h5
      </VChip>

      <VChip
        :color="editor.isActive('heading', { level: 6 }) ? 'primary' : ''"
        @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
      >
        h6
      </VChip>

      <VChip
        :color="editor.isActive('bulletList') ? 'primary' : ''"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        bullet list
      </VChip>

      <VChip
        :color="editor.isActive('orderedList') ? 'primary' : ''"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        ordered list
      </VChip>

      <VChip
        :color="editor.isActive('codeBlock') ? 'primary' : ''"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      >
        code block
      </VChip>

      <VChip
        :color="editor.isActive('blockquote') ? 'primary' : ''"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        blockquote
      </VChip>

      <VChip @click="editor.chain().focus().setHorizontalRule().run()">
        horizontal rule
      </VChip>

      <VChip @click="editor.chain().focus().setHardBreak().run()">
        hard break
      </VChip>

      <VChip
        :disabled="!editor.can().chain().focus().undo().run()"
        @click="editor.chain().focus().undo().run()"
      >
        undo
      </VChip>

      <VChip
        :disabled="!editor.can().chain().focus().redo().run()"
        @click="editor.chain().focus().redo().run()"
      >
        redo
      </VChip>
    </div>
    <VDivider class="my-4" />
    <EditorContent :editor="editor" />
  </div>
</template>

<style lang="scss">
/* Basic editor styles */

.custom-editor {
  .ProseMirror {
    > * + * {
      margin-block-start: 0.75em;
    }

    outline: none;
    overflow-y: auto;
    padding-inline: 0.5rem;

    ul,
    ol {
      padding-block: 0;
      padding-inline: 1rem;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      line-height: 1.1;
    }

    code {
      background-color: rgba(#616161, 0.1);
      color: #616161;
    }

    pre {
      border-radius: 0.5rem;
      background: #0d0d0d;
      color: #fff;
      font-family: JetBrainsMono, monospace;
      padding-block: 0.75rem;
      padding-inline: 1rem;

      code {
        padding: 0;
        background: none;
        color: inherit;
        font-size: 0.8rem;
      }
    }

    img {
      block-size: auto;
      max-inline-size: 100%;
    }

    blockquote {
      border-inline-start: 2px solid rgba(#0d0d0d, 0.1);
      padding-inline-start: 1rem;
    }

    hr {
      border: none;
      border-block-start: 2px solid rgba(#0d0d0d, 0.1);
      margin-block: 2rem;
      margin-inline: 0;
    }
  }
}
</style>
`,js:`<script setup>
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { StarterKit } from '@tiptap/starter-kit'
import {
  EditorContent,
  useEditor,
} from '@tiptap/vue-3'

const editor = useEditor({
  content: \`
        <h2>
          Hi there,
        </h2>
        <p>
          this is a <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you'd probably expect from a text editor. But wait until you see the lists:
        </p>
        <ul>
          <li>
            That's a bullet list with one …
          </li>
          <li>
            … or two list items.
          </li>
        </ul>
        <p>
          Isn't that great? And all of that is editable. But wait, there's more. Let's try a code block:
        </p>
        <pre><code class="language-css">body {
  display: none;
}</code></pre>
        <p>
          I know, I know, this is impressive. It's only the tip of the iceberg though. Give it a try and click a little bit around. Don't forget to check the other examples too.
        </p>
        <blockquote>
          Wow, that's amazing. Good work, boy! 👏
          <br />
          — Mom
        </blockquote>
      \`,
  extensions: [
    StarterKit,
    TextAlign.configure({
      types: [
        'heading',
        'paragraph',
      ],
    }),
    Placeholder.configure({ placeholder: 'Write something here...' }),
    Underline,
  ],
})
<\/script>

<template>
  <div class="border pa-2 rounded custom-editor">
    <div
      v-if="editor"
      class="d-flex flex-wrap gap-x-4 gap-y-2 mb-2"
    >
      <VChip
        :disabled="!editor.can().chain().focus().toggleBold().run()"
        :color="editor.isActive('bold') ? 'primary' : ''"
        @click="editor.chain().focus().toggleBold().run()"
      >
        bold
      </VChip>

      <VChip
        :disabled="!editor.can().chain().focus().toggleItalic().run()"
        :color="editor.isActive('italic') ? 'primary' : ''"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        italic
      </VChip>

      <VChip
        :disabled="!editor.can().chain().focus().toggleStrike().run()"
        :color="editor.isActive('strike') ? 'primary' : ''"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        strike
      </VChip>

      <VChip
        :disabled="!editor.can().chain().focus().toggleCode().run()"
        :color="editor.isActive('code') ? 'primary' : ''"
        @click="editor.chain().focus().toggleCode().run()"
      >
        code
      </VChip>

      <VChip @click="editor.chain().focus().unsetAllMarks().run()">
        clear marks
      </VChip>

      <VChip @click="editor.chain().focus().clearNodes().run()">
        clear nodes
      </VChip>

      <VChip
        :color="editor.isActive('paragraph') ? 'primary' : ''"
        @click="editor.chain().focus().setParagraph().run()"
      >
        paragraph
      </VChip>

      <VChip
        :color="editor.isActive('heading', { level: 1 }) ? 'primary' : ''"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        h1
      </VChip>

      <VChip
        :color="editor.isActive('heading', { level: 2 }) ? 'primary' : ''"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        h2
      </VChip>

      <VChip
        :color="editor.isActive('heading', { level: 3 }) ? 'primary' : ''"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        h3
      </VChip>

      <VChip
        :color="editor.isActive('heading', { level: 4 }) ? 'primary' : ''"
        @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
      >
        h4
      </VChip>

      <VChip
        :color="editor.isActive('heading', { level: 5 }) ? 'primary' : ''"
        @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
      >
        h5
      </VChip>

      <VChip
        :color="editor.isActive('heading', { level: 6 }) ? 'primary' : ''"
        @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
      >
        h6
      </VChip>

      <VChip
        :color="editor.isActive('bulletList') ? 'primary' : ''"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        bullet list
      </VChip>

      <VChip
        :color="editor.isActive('orderedList') ? 'primary' : ''"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        ordered list
      </VChip>

      <VChip
        :color="editor.isActive('codeBlock') ? 'primary' : ''"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      >
        code block
      </VChip>

      <VChip
        :color="editor.isActive('blockquote') ? 'primary' : ''"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        blockquote
      </VChip>

      <VChip @click="editor.chain().focus().setHorizontalRule().run()">
        horizontal rule
      </VChip>

      <VChip @click="editor.chain().focus().setHardBreak().run()">
        hard break
      </VChip>

      <VChip
        :disabled="!editor.can().chain().focus().undo().run()"
        @click="editor.chain().focus().undo().run()"
      >
        undo
      </VChip>

      <VChip
        :disabled="!editor.can().chain().focus().redo().run()"
        @click="editor.chain().focus().redo().run()"
      >
        redo
      </VChip>
    </div>
    <VDivider class="my-4" />
    <EditorContent :editor="editor" />
  </div>
</template>

<style lang="scss">
/* Basic editor styles */

.custom-editor {
  .ProseMirror {
    > * + * {
      margin-block-start: 0.75em;
    }

    outline: none;
    overflow-y: auto;
    padding-inline: 0.5rem;

    ul,
    ol {
      padding-block: 0;
      padding-inline: 1rem;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      line-height: 1.1;
    }

    code {
      background-color: rgba(#616161, 0.1);
      color: #616161;
    }

    pre {
      border-radius: 0.5rem;
      background: #0d0d0d;
      color: #fff;
      font-family: JetBrainsMono, monospace;
      padding-block: 0.75rem;
      padding-inline: 1rem;

      code {
        padding: 0;
        background: none;
        color: inherit;
        font-size: 0.8rem;
      }
    }

    img {
      block-size: auto;
      max-inline-size: 100%;
    }

    blockquote {
      border-inline-start: 2px solid rgba(#0d0d0d, 0.1);
      padding-inline-start: 1rem;
    }

    hr {
      border: none;
      border-block-start: 2px solid rgba(#0d0d0d, 0.1);
      margin-block: 2rem;
      margin-inline: 0;
    }
  }
}
</style>
`},Q=p({__name:"editors",setup(u){return(e,h)=>{const i=T,l=w,d=_;return c(),B(H,null,{default:r(()=>[t(g,{cols:"12"},{default:r(()=>[t(l,{title:"Basic Editor",code:q},{default:r(()=>[t(i)]),_:1},8,["code"])]),_:1}),t(g,{cols:"12"},{default:r(()=>[t(l,{title:"Custom Editor",code:S},{default:r(()=>[t(d)]),_:1},8,["code"])]),_:1})]),_:1})}}});export{Q as default};
