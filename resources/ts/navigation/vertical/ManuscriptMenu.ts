export default [
  { heading: 'menu.manuscripts' },
  
  {
    title: 'menu.manuscripts.all',
    icon: { icon: 'bx-book' },
    to: 'manuscripts-list',
    action: 'read',
    subject: 'manuscripts',
  },
  {
    title: 'menu.manuscripts.items',
    icon: { icon: 'bx-book-content' },
    children: [
      {
        title: 'menu.manuscripts.items.chapters',
        to: 'manuscripts-chapters',
        action: 'read',
        subject: 'manuscripts',
      },
      {
        title: 'menu.manuscripts.items.scenes',
        to: 'manuscripts-scenes',
        action: 'read',
        subject: 'manuscripts',
      },
      {
        title: 'menu.manuscripts.items.characters',
        to: 'manuscripts-characters',
        action: 'read',
        subject: 'manuscripts',
      },
      {
        title: 'menu.manuscripts.items.locations',
        to: 'manuscripts-locations',
        action: 'read',
        subject: 'manuscripts',
      },
      {
        title: 'menu.manuscripts.items.research',
        to: 'manuscripts-research',
        action: 'read',
        subject: 'manuscripts',
      },
    ],
  },
] 
