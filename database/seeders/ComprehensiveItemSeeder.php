<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\User;
use Illuminate\Database\Seeder;

class ComprehensiveItemSeeder extends Seeder
{
    private $user;
    private $itemIdCounter = 1;

    public function run(): void
    {
        // Find the user with email info@freynet-gagne.com
        $this->user = User::where('email', 'info@freynet-gagne.com')->first();

        if (!$this->user) {
            $this->command->error('User info@freynet-gagne.com not found!');
            return;
        }

        $this->createItemsForTheLastChapter();
        $this->createItemsForEchoesOfTomorrow();
        $this->createItemsForGardenOfMemories();
        $this->createItemsForClientProject();
        $this->createItemsForPoetryCollection();

        $this->command->info('Created comprehensive hierarchical item structure for all manuscripts');
    }

    /**
     * Create items for "The Last Chapter" - Mystery Novel
     */
    private function createItemsForTheLastChapter(): void
    {
        // Draft folder (root)
        $draftFolder = $this->createItem([
            'type' => 'folder',
            'title' => 'Draft',
            'synopsis' => 'Main manuscript content',
            'folder_type' => 'Draft',
            'item_order' => 1,
            'include_in_compile' => true,
        ]);

        // Chapters in Draft folder
        $this->createItem([
            'type' => 'text',
            'title' => 'Chapter 1: The Discovery',
            'content' => "# Chapter 1: The Discovery\n\nSarah Chen stared at her computer screen, the cursor blinking mockingly at the end of an unfinished sentence. She'd been struggling with writer's block for weeks, but tonight felt different. As she typed, the words seemed to flow from somewhere else entirely.\n\n\"The detective would soon realize that her own story was being written by someone else,\" she typed, then paused. That wasn't what she'd intended to write.\n\nA chill ran down her spine as she read the words again. This was supposed to be a mystery novel about a serial killer, not... this.\n\nShe deleted the line and tried again, but her fingers seemed to move of their own accord: \"Sarah Chen stared at her computer screen, the cursor blinking mockingly...\"\n\nHer heart stopped. Those were the exact words she'd written moments before – about herself.",
            'content_markdown' => "# Chapter 1: The Discovery\n\nSarah Chen stared at her computer screen, the cursor blinking mockingly at the end of an unfinished sentence. She'd been struggling with writer's block for weeks, but tonight felt different. As she typed, the words seemed to flow from somewhere else entirely.\n\n\"The detective would soon realize that her own story was being written by someone else,\" she typed, then paused. That wasn't what she'd intended to write.\n\nA chill ran down her spine as she read the words again. This was supposed to be a mystery novel about a serial killer, not... this.\n\nShe deleted the line and tried again, but her fingers seemed to move of their own accord: \"Sarah Chen stared at her computer screen, the cursor blinking mockingly...\"\n\nHer heart stopped. Those were the exact words she'd written moments before – about herself.",
            'synopsis' => 'Sarah discovers that her story is being written by someone else. The meta-fictional element is introduced.',
            'word_count' => 185,
            'character_count' => 1020,
            'item_order' => 1,
            'include_in_compile' => true,
            'parent_id' => $draftFolder->id,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Chapter 2: First Clues',
            'content' => "# Chapter 2: First Clues\n\nSarah couldn't sleep. Every time she closed her eyes, she saw those words on her screen. She'd tried to convince herself it was just a coincidence, but deep down she knew something impossible was happening.\n\nAt 3 AM, she crept back to her computer. The document was still open, and new text had appeared:\n\n\"Sarah couldn't sleep. Every time she closed her eyes, she saw those words on her screen.\"\n\nShe hadn't written that. The timestamp showed it had been added while she was trying to sleep.\n\nWith trembling hands, she scrolled down. More text appeared:\n\n\"With trembling hands, she scrolled down.\"\n\nSomeone – or something – was writing her life in real-time.",
            'synopsis' => 'Sarah realizes someone is writing her life in real-time. The supernatural element intensifies.',
            'word_count' => 142,
            'character_count' => 785,
            'item_order' => 2,
            'include_in_compile' => true,
            'parent_id' => $draftFolder->id,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Chapter 3: The Plot Thickens',
            'content' => "# Chapter 3: The Plot Thickens\n\nSarah decided to fight back. If someone was controlling her story, she would take control herself. She began typing furiously:\n\n\"Sarah decided to call the police, but when she reached for her phone, it wasn't there.\"\n\nShe looked around. Her phone was gone.\n\n\"She would check the kitchen counter where she always left it.\"\n\nNo choice. Her legs carried her to the kitchen, and there was her phone, exactly where the story said it would be.\n\n\"But when she tried to dial, the screen would show only one contact: The Author.\"\n\nSarah's hands shook as she unlocked the phone. Her contact list had been wiped clean except for a single entry: \"The Author.\"\n\nShe pressed call.",
            'synopsis' => 'Sarah tries to fight back against the mysterious author but finds herself trapped in the narrative.',
            'word_count' => 151,
            'character_count' => 830,
            'item_order' => 3,
            'include_in_compile' => true,
            'parent_id' => $draftFolder->id,
        ]);

        // Research folder
        $researchFolder = $this->createItem([
            'type' => 'folder',
            'title' => 'Research',
            'synopsis' => 'Background research and reference materials',
            'folder_type' => 'Research',
            'item_order' => 2,
            'include_in_compile' => false,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Meta-Fiction Research',
            'content' => "# Meta-Fiction Research\n\n## Key Elements\n- Self-referential narrative\n- Breaking the fourth wall\n- Characters aware of being fictional\n- Reality vs. fiction blur\n\n## Literary Examples\n- \"The French Lieutenant's Woman\" by John Fowles\n- \"If on a winter's night a traveler\" by Italo Cavalino\n- \"The Neverending Story\" by Michael Ende\n\n## Psychological Aspects\n- Dissociation\n- Loss of agency\n- Identity crisis\n- Paranoia and helplessness",
            'synopsis' => 'Research notes on meta-fictional storytelling techniques and psychological themes',
            'word_count' => 85,
            'character_count' => 520,
            'item_order' => 1,
            'include_in_compile' => false,
            'parent_id' => $researchFolder->id,
        ]);

        $this->createItem([
            'type' => 'link',
            'title' => 'Meta-Fiction Articles',
            'content' => 'https://literarydevices.net/meta-fiction/',
            'synopsis' => 'Online resources about meta-fiction techniques',
            'item_order' => 2,
            'include_in_compile' => false,
            'parent_id' => $researchFolder->id,
        ]);

        // Characters folder
        $charactersFolder = $this->createItem([
            'type' => 'folder',
            'title' => 'Characters',
            'synopsis' => 'Character profiles and development notes',
            'folder_type' => 'Characters',
            'item_order' => 3,
            'include_in_compile' => false,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Sarah Chen - Protagonist',
            'content' => "# Sarah Chen - Protagonist\n\n**Age:** 32\n**Occupation:** Mystery novelist\n**Background:** Former journalist turned fiction writer\n\n## Physical Description\n- Height: 5'6\"\n- Asian-American\n- Short black hair\n- Brown eyes\n- Often wears comfortable writing clothes\n\n## Personality\n- Analytical mind from journalism background\n- Stubborn and determined\n- Suffers from mild anxiety\n- Perfectionist tendencies\n\n## Character Arc\n- Starts confident in her writing ability\n- Becomes increasingly paranoid as reality blurs\n- Must learn to regain control of her narrative\n- Discovers inner strength through adversity",
            'synopsis' => 'Detailed character profile for the protagonist Sarah Chen',
            'word_count' => 115,
            'character_count' => 690,
            'item_order' => 1,
            'include_in_compile' => false,
            'parent_id' => $charactersFolder->id,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'The Author - Antagonist',
            'content' => "# The Author - Antagonist\n\n**Identity:** Unknown\n**Nature:** Mysterious entity controlling the narrative\n\n## Characteristics\n- Omniscient perspective\n- Appears to exist outside normal reality\n- Controls Sarah's actions through the story\n- Motivations unclear\n\n## Powers/Abilities\n- Can alter reality through writing\n- Anticipates character actions\n- Exists across multiple narrative layers\n- May not be entirely malevolent\n\n## Role in Story\n- Primary antagonist force\n- Represents loss of free will\n- Symbol of writer's relationship with characters\n- Potential for redemption or explanation in final act",
            'synopsis' => 'Character notes for the mysterious Author entity',
            'word_count' => 105,
            'character_count' => 640,
            'item_order' => 2,
            'include_in_compile' => false,
            'parent_id' => $charactersFolder->id,
        ]);

        // Planning folder
        $planningFolder = $this->createItem([
            'type' => 'folder',
            'title' => 'Planning',
            'synopsis' => 'Plot outlines, structure notes, and planning documents',
            'folder_type' => 'Planning',
            'item_order' => 4,
            'include_in_compile' => false,
        ]);

        $this->createItem([
            'type' => 'mindmap',
            'title' => 'Plot Structure',
            'content' => json_encode([
                'nodes' => [
                    ['id' => 1, 'text' => 'Act I: Discovery', 'x' => 100, 'y' => 50],
                    ['id' => 2, 'text' => 'Inciting Incident', 'x' => 50, 'y' => 150],
                    ['id' => 3, 'text' => 'First Clues', 'x' => 150, 'y' => 150],
                    ['id' => 4, 'text' => 'Act II: Investigation', 'x' => 300, 'y' => 50],
                    ['id' => 5, 'text' => 'Fighting Back', 'x' => 250, 'y' => 150],
                    ['id' => 6, 'text' => 'Escalation', 'x' => 350, 'y' => 150],
                    ['id' => 7, 'text' => 'Act III: Resolution', 'x' => 500, 'y' => 50],
                    ['id' => 8, 'text' => 'Confrontation', 'x' => 450, 'y' => 150],
                    ['id' => 9, 'text' => 'Truth Revealed', 'x' => 550, 'y' => 150],
                ],
                'connections' => [
                    ['from' => 1, 'to' => 2],
                    ['from' => 1, 'to' => 3],
                    ['from' => 3, 'to' => 4],
                    ['from' => 4, 'to' => 5],
                    ['from' => 4, 'to' => 6],
                    ['from' => 6, 'to' => 7],
                    ['from' => 7, 'to' => 8],
                    ['from' => 7, 'to' => 9],
                ]
            ]),
            'synopsis' => 'Visual plot structure using mindmap format',
            'item_order' => 1,
            'include_in_compile' => false,
            'parent_id' => $planningFolder->id,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Chapter Outline',
            'content' => "# Chapter Outline - The Last Chapter\n\n## Act I: The Discovery (Chapters 1-3)\n\n### Chapter 1: The Discovery\n- Sarah experiences writer's block\n- Words appear that she didn't write\n- Realizes someone else is controlling her story\n- **Goal:** Establish the supernatural premise\n\n### Chapter 2: First Clues\n- Sarah investigates the phenomenon\n- Text appears in real-time while she sleeps\n- Tries rational explanations\n- **Goal:** Build tension and mystery\n\n### Chapter 3: The Plot Thickens\n- Sarah attempts to fight back\n- Discovers she can't escape the narrative\n- Phones \"The Author\" contact\n- **Goal:** Escalate the conflict\n\n## Act II: The Investigation (Chapters 4-8)\n\n### Chapter 4: The Voice\n- First contact with The Author\n- Rules of the game explained\n- Sarah's world becomes more constrained\n- **Goal:** Establish the antagonist\n\n### Chapter 5: Research Mode\n- Sarah investigates meta-fiction\n- Discovers similar cases in literature\n- Realizes the broader implications\n- **Goal:** Worldbuilding and exposition\n\n### Chapter 6: Allies and Enemies\n- Sarah tries to contact others for help\n- The Author manipulates her relationships\n- Friends and family seem scripted\n- **Goal:** Isolate the protagonist\n\n### Chapter 7: The Rules\n- Sarah learns the limitations of her situation\n- Discovers she has some agency within constraints\n- Begins to understand The Author's motivations\n- **Goal:** Character development and strategy\n\n### Chapter 8: The Trap\n- Sarah thinks she's found a way out\n- The Author reveals it was all planned\n- Darkest moment for the protagonist\n- **Goal:** Major setback and emotional low point\n\n## Act III: The Resolution (Chapters 9-12)\n\n### Chapter 9: The Truth\n- Sarah discovers The Author's true identity\n- Realizes the connection to her own past\n- Understanding changes everything\n- **Goal:** Major revelation and twist\n\n### Chapter 10: The Choice\n- Sarah must decide her fate\n- Confronts The Author directly\n- Stakes are raised to maximum\n- **Goal:** Final confrontation setup\n\n### Chapter 11: The Last Chapter\n- Title chapter - meta-textual climax\n- Sarah writes her own ending\n- Battle for narrative control\n- **Goal:** Climax and resolution\n\n### Chapter 12: Epilogue\n- Resolution of the meta-fictional elements\n- Sarah's new relationship with writing\n- Ambiguous but hopeful ending\n- **Goal:** Denouement and thematic resolution",
            'synopsis' => 'Detailed chapter-by-chapter outline for the entire novel',
            'word_count' => 425,
            'character_count' => 2840,
            'item_order' => 2,
            'include_in_compile' => false,
            'parent_id' => $planningFolder->id,
        ]);
    }

    /**
     * Create items for "Echoes of Tomorrow" - Sci-Fi Novel
     */
    private function createItemsForEchoesOfTomorrow(): void
    {
        // Manuscript folder (root)
        $manuscriptFolder = $this->createItem([
            'type' => 'folder',
            'title' => 'Manuscript',
            'synopsis' => 'Main story content organized by parts',
            'folder_type' => 'Draft',
            'item_order' => 1,
            'include_in_compile' => true,
        ]);

        // Part I folder
        $partIFolder = $this->createItem([
            'type' => 'folder',
            'title' => 'Part I: The Discovery',
            'synopsis' => 'First contact and initial discoveries',
            'item_order' => 1,
            'include_in_compile' => true,
            'parent_id' => $manuscriptFolder->id,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Chapter 1: First Contact',
            'content' => "# Chapter 1: First Contact\n\nDr. Elena Vasquez adjusted the radio telescope's positioning for the hundredth time that night. Three months of monitoring deep space had yielded nothing but cosmic background radiation and the occasional pulsar. The SETI Institute was threatening to cut funding if she didn't produce results soon.\n\nAt 2:47 AM, the computers detected something extraordinary.\n\nIt wasn't the random noise of the cosmos. This was structured, mathematical, deliberate. A pattern that repeated every 11.7 seconds, embedded within a carrier wave that shouldn't exist.\n\nElena's hands trembled as she isolated the signal. Hidden within the mathematical sequence was something impossible: tomorrow's stock market data, accurate to the decimal point.\n\nSomeone – or something – was sending information backwards through time.",
            'synopsis' => 'Elena discovers a signal from the future containing temporal information',
            'word_count' => 142,
            'character_count' => 820,
            'item_order' => 1,
            'include_in_compile' => true,
            'parent_id' => $partIFolder->id,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Chapter 2: The Message',
            'content' => "# Chapter 2: The Message\n\nElena spent the next week verifying the impossible. Every piece of \"future\" data in the signal proved accurate. Weather patterns, earthquake tremors, even the results of random number generators – all predicted with perfect precision.\n\nBut on day seven, the signal changed.\n\nBuried deeper in the transmission, she found a message in perfect English:\n\n\"Dr. Vasquez. You are receiving this from 2157. Our timeline is collapsing. The experiment we began in your time has created a temporal paradox that will destroy causality itself. You must stop us from building the Chronos Array. The coordinates follow. You have 72 hours before the cascade begins.\"\n\nElena stared at the screen. According to the coordinates, she needed to stop an experiment that didn't exist yet – an experiment she was apparently destined to create.",
            'synopsis' => 'Elena receives a warning from the future about a temporal experiment she will create',
            'word_count' => 155,
            'character_count' => 890,
            'item_order' => 2,
            'include_in_compile' => true,
            'parent_id' => $partIFolder->id,
        ]);

        // Part II folder
        $partIIFolder = $this->createItem([
            'type' => 'folder',
            'title' => 'Part II: The Journey',
            'synopsis' => 'Elena travels to prevent the temporal catastrophe',
            'item_order' => 2,
            'include_in_compile' => true,
            'parent_id' => $manuscriptFolder->id,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Chapter 3: Departure',
            'content' => "# Chapter 3: Departure\n\nElena's attempt to contact the authorities had failed spectacularly. The government either thought she was insane or wanted to weaponize the technology. Neither option would prevent the temporal cascade.\n\nShe had one choice: find the future location of the Chronos Array and make sure it was never built.\n\nThe coordinates led to a remote facility in Northern Canada, officially listed as a geological survey station. Elena packed her research, withdrew her life savings, and bought a ticket north.\n\nAs her plane lifted off, she watched the city disappear below. In the radio signal's data, she'd seen the future: this city, along with every other human settlement, reduced to temporal static in 2157.\n\nShe was humanity's only hope of never existing.",
            'synopsis' => 'Elena travels to the site where the future facility will be built',
            'word_count' => 145,
            'character_count' => 830,
            'item_order' => 1,
            'include_in_compile' => true,
            'parent_id' => $partIIFolder->id,
        ]);

        // World Building folder
        $worldBuildingFolder = $this->createItem([
            'type' => 'folder',
            'title' => 'World Building',
            'synopsis' => 'Scientific concepts, technology, and future history',
            'folder_type' => 'Research',
            'item_order' => 2,
            'include_in_compile' => false,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Temporal Mechanics',
            'content' => "# Temporal Mechanics in Echoes of Tomorrow\n\n## The Chronos Array\n- Quantum entanglement-based temporal communication system\n- Uses tachyon streams to send information backward in time\n- Originally designed for archaeological research\n- Accidentally creates causal loops\n\n## Temporal Paradox Types\n1. **Bootstrap Paradox**: Information with no origin point\n2. **Grandfather Paradox**: Preventing one's own existence\n3. **Cascade Paradox**: Recursive temporal loops that destroy causality\n\n## Scientific Basis\n- Closed timelike curves (CTCs) from general relativity\n- Quantum mechanics uncertainty principle\n- Many-worlds interpretation\n- Novikov self-consistency principle\n\n## Timeline Rules\n- Information can travel backward, matter cannot\n- Changes create parallel timelines rather than altering history\n- Temporal cascades occur when too many parallel timelines intersect\n- The universe has a \"temporal immune system\" that resists paradoxes",
            'synopsis' => 'Technical explanation of time travel mechanics used in the story',
            'word_count' => 165,
            'character_count' => 1025,
            'item_order' => 1,
            'include_in_compile' => false,
            'parent_id' => $worldBuildingFolder->id,
        ]);

        $this->createItem([
            'type' => 'mindmap',
            'title' => 'Future Timeline Map',
            'content' => json_encode([
                'nodes' => [
                    ['id' => 1, 'text' => '2024: Discovery', 'x' => 100, 'y' => 100],
                    ['id' => 2, 'text' => '2025-2030: Development', 'x' => 250, 'y' => 100],
                    ['id' => 3, 'text' => '2031: First Tests', 'x' => 400, 'y' => 100],
                    ['id' => 4, 'text' => '2040: Chronos Array Built', 'x' => 550, 'y' => 100],
                    ['id' => 5, 'text' => '2045: Temporal Communication', 'x' => 700, 'y' => 100],
                    ['id' => 6, 'text' => '2050-2100: Golden Age', 'x' => 400, 'y' => 200],
                    ['id' => 7, 'text' => '2150: Paradox Begins', 'x' => 250, 'y' => 300],
                    ['id' => 8, 'text' => '2157: Timeline Collapse', 'x' => 100, 'y' => 400],
                    ['id' => 9, 'text' => 'Warning Sent', 'x' => 100, 'y' => 50],
                ],
                'connections' => [
                    ['from' => 1, 'to' => 2],
                    ['from' => 2, 'to' => 3],
                    ['from' => 3, 'to' => 4],
                    ['from' => 4, 'to' => 5],
                    ['from' => 5, 'to' => 6],
                    ['from' => 6, 'to' => 7],
                    ['from' => 7, 'to' => 8],
                    ['from' => 8, 'to' => 9],
                    ['from' => 9, 'to' => 1],
                ]
            ]),
            'synopsis' => 'Visual timeline showing the progression from discovery to temporal collapse',
            'item_order' => 2,
            'include_in_compile' => false,
            'parent_id' => $worldBuildingFolder->id,
        ]);
    }

    /**
     * Create items for "The Garden of Memories" - Completed Novel
     */
    private function createItemsForGardenOfMemories(): void
    {
        // Final Draft folder
        $finalDraftFolder = $this->createItem([
            'type' => 'folder',
            'title' => 'Final Draft',
            'synopsis' => 'Completed manuscript ready for publication',
            'folder_type' => 'Draft',
            'item_order' => 1,
            'include_in_compile' => true,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Chapter 1: Seeds of Memory',
            'content' => "# Chapter 1: Seeds of Memory\n\nMargaret Thornfield knelt among the lavender, her arthritic hands gentle against the purple stems. At eighty-three, she moved slowly but purposefully through her garden, each plant a carefully tended memory.\n\nThe lavender held the memory of her grandmother's linen closet. The rosemary carried her mother's Sunday roasts. And the newly planted forget-me-nots... those held David.\n\nShe'd buried the seeds with his wedding ring three days after the funeral, whispering his name into the earth. The hospice nurse had called it 'grief therapy.' Margaret called it magic.\n\nBecause this morning, for the first time in forty years, she could hear David's laugh again.",
            'synopsis' => 'Introduction to Margaret and her magical garden where plants hold memories of the deceased',
            'word_count' => 132,
            'character_count' => 720,
            'item_order' => 1,
            'include_in_compile' => true,
            'parent_id' => $finalDraftFolder->id,
        ]);

        // Publication Materials folder
        $pubFolder = $this->createItem([
            'type' => 'folder',
            'title' => 'Publication Materials',
            'synopsis' => 'Query letters, synopsis, and submission materials',
            'folder_type' => 'Research',
            'item_order' => 2,
            'include_in_compile' => false,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Query Letter',
            'content' => "Dear [Agent Name],\n\nTHE GARDEN OF MEMORIES is an 85,000-word magical realism novel that will appeal to readers of Alice Hoffman's \"The Rules of Magic\" and Sarah Addison Allen's \"Garden Spells.\"\n\nEighty-three-year-old Margaret Thornfield discovers that the plants in her garden can hold the memories of the dead. When she plants forget-me-nots with her late husband's wedding ring, she can hear his voice again. But the garden's magic comes with a cost: each memory preserved takes something from the living.\n\nAs Margaret shares her secret with her skeptical daughter and lonely neighbor, three generations of women must confront what they're willing to sacrifice to keep their loved ones close. When a developer threatens to destroy the garden, Margaret faces an impossible choice between preserving the past and protecting the future.\n\nI am a [credentials]. THE GARDEN OF MEMORIES is my debut novel.\n\nThank you for your time and consideration.\n\nSincerely,\n[Your name]",
            'synopsis' => 'Professional query letter for agent submissions',
            'word_count' => 165,
            'character_count' => 980,
            'item_order' => 1,
            'include_in_compile' => false,
            'parent_id' => $pubFolder->id,
        ]);
    }

    /**
     * Create items for "Client Project: Corporate Thriller"
     */
    private function createItemsForClientProject(): void
    {
        // Manuscript folder
        $manuscriptFolder = $this->createItem([
            'type' => 'folder',
            'title' => 'Client Draft',
            'synopsis' => 'Working draft for client review',
            'folder_type' => 'Draft',
            'item_order' => 1,
            'include_in_compile' => true,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Chapter 1: The Whistleblower',
            'content' => "# Chapter 1: The Whistleblower\n\nThe email arrived at 11:47 PM on a Tuesday, sent from an account that shouldn't exist. Subject line: \"They know about Phoenix.\"\n\nAlex Rivera stared at the message, her coffee growing cold. Phoenix was the code name for TechNova's most classified project – an AI system that could predict market crashes with 97% accuracy. Only twelve people in the world knew it existed.\n\nAnd one of them was trying to expose it.\n\nThe message contained a single attachment: a video file showing TechNova's CEO discussing plans to manipulate the global economy. Alex's stomach dropped as she recognized the voice of her mentor, the man who'd hired her five years ago.\n\nShe had forty-eight hours to decide: protect the company that made her career, or expose the conspiracy that could destroy the world's financial system.",
            'synopsis' => 'Alex discovers evidence of her company\'s plan to manipulate global markets using AI',
            'word_count' => 162,
            'character_count' => 920,
            'item_order' => 1,
            'include_in_compile' => true,
            'parent_id' => $manuscriptFolder->id,
        ]);

        // Client Notes folder
        $clientNotesFolder = $this->createItem([
            'type' => 'folder',
            'title' => 'Client Requirements',
            'synopsis' => 'Client specifications and feedback',
            'folder_type' => 'Research',
            'item_order' => 2,
            'include_in_compile' => false,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Project Brief',
            'content' => "# Client Project Brief - Corporate Thriller\n\n## Client Requirements\n- 80,000-word commercial thriller\n- Corporate espionage theme\n- Female protagonist in tech industry\n- Realistic portrayal of AI/machine learning\n- High-stakes financial conspiracy\n- Target audience: adults 25-45\n- Completion deadline: March 1, 2025\n\n## Themes to Include\n- Whistleblowing ethics\n- Corporate responsibility\n- Technology's impact on society\n- Personal vs. professional loyalty\n- David vs. Goliath dynamics\n\n## Tone & Style\n- Fast-paced, contemporary\n- Technically accurate but accessible\n- Morally complex characters\n- Realistic dialogue\n- Cinematic action sequences\n\n## Research Areas\n- SEC regulations\n- Market manipulation techniques\n- AI/ML capabilities and limitations\n- Corporate whistleblower protections\n- Financial system vulnerabilities",
            'synopsis' => 'Detailed client specifications and project requirements',
            'word_count' => 150,
            'character_count' => 950,
            'item_order' => 1,
            'include_in_compile' => false,
            'parent_id' => $clientNotesFolder->id,
        ]);
    }

    /**
     * Create items for "Poetry Collection: Urban Sunrise"
     */
    private function createItemsForPoetryCollection(): void
    {
        // Poems folder
        $poemsFolder = $this->createItem([
            'type' => 'folder',
            'title' => 'Poems',
            'synopsis' => 'Individual poems in the collection',
            'folder_type' => 'Draft',
            'item_order' => 1,
            'include_in_compile' => true,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Digital Dawn',
            'content' => "# Digital Dawn\n\nIn the blue light of screens at 6 AM,\nwe scroll through other people's dreams,\ndouble-tap hearts for strangers\nwhile our own hearts beat\nunsynchronized, alone.\n\nThe sun rises over glass towers,\ncasting shadows on sidewalks\nwhere hurried feet tap rhythms\nonly pigeons seem to hear.\n\nSomewhere between notifications\nand noise-canceling headphones,\nwe lost the art of listening—\nto morning birds,\nto our own breathing,\nto the city's quiet pulse\nunderneath the chaos.\n\nBut still, the sun rises.\nStill, the light finds us\neven through our windows,\neven through our walls,\neven through our carefully\ncurated digital lives.\n\nAnd in that first moment\nbefore the day begins,\nbefore the emails arrive,\nbefore the world demands\nour divided attention—\n\nthere is only this:\nbreath, light, possibility.\nThe ancient promise\nof another chance\nto be human.",
            'synopsis' => 'Opening poem about finding humanity in the digital age',
            'word_count' => 145,
            'character_count' => 920,
            'item_order' => 1,
            'include_in_compile' => true,
            'parent_id' => $poemsFolder->id,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Subway Connections',
            'content' => "# Subway Connections\n\nUnderground, we are\nall travelers—\n\nthe business suit reading Neruda,\nthe teenager sketching strangers,\nthe grandmother humming\nlullabies in languages\nthis city has forgotten.\n\nFor seventeen minutes\nbetween stations,\nwe share the same air,\nthe same fluorescent light,\nthe same gentle swaying\nas the train carries us\nthrough tunnels carved\nfrom a century of hope.\n\nNo one speaks.\nEveryone listens—\nto the rails singing\ntheir metal songs,\nto the conductor's voice\ncalling out stops\nlike an urban poet\nnaming the places\nwhere people build lives.\n\nAnd when the doors open,\nwe scatter like seeds\ninto the sunlight,\ncarrying small pieces\nof each other's stories\ninto the day.",
            'synopsis' => 'Poem about human connection in public transportation',
            'word_count' => 125,
            'character_count' => 740,
            'item_order' => 2,
            'include_in_compile' => true,
            'parent_id' => $poemsFolder->id,
        ]);

        // Notes folder for poetry collection
        $notesFolder = $this->createItem([
            'type' => 'folder',
            'title' => 'Collection Notes',
            'synopsis' => 'Themes, structure, and publication notes',
            'folder_type' => 'Research',
            'item_order' => 2,
            'include_in_compile' => false,
        ]);

        $this->createItem([
            'type' => 'text',
            'title' => 'Thematic Structure',
            'content' => "# Urban Sunrise - Thematic Structure\n\n## Overall Theme\nFinding human connection and beauty in urban environments during the digital age\n\n## Section I: Dawn (Morning Poems)\n- Digital Dawn\n- Coffee Shop Chronicles\n- Rush Hour Meditation\n- Morning Runner\n\n## Section II: Noon (Day Poems)  \n- Lunch Break Haiku\n- Window Washer\n- Street Musician\n- Food Truck Philosophy\n\n## Section III: Dusk (Evening Poems)\n- Subway Connections\n- Happy Hour Loneliness\n- Night Shift\n- Last Train Home\n\n## Section IV: Night (Reflection Poems)\n- Insomnia in Apartment 4B\n- Night Sounds\n- City Dreams\n- Tomorrow's Promise\n\n## Publication Goals\n- Submit to literary magazines first\n- Chapbook contest submissions\n- Consider self-publishing option\n- Reading series participation",
            'synopsis' => 'Organizational structure and publication strategy for poetry collection',
            'word_count' => 140,
            'character_count' => 890,
            'item_order' => 1,
            'include_in_compile' => false,
            'parent_id' => $notesFolder->id,
        ]);
    }

    /**
     * Helper method to create an item with consistent metadata
     */
    private function createItem(array $data): Item
    {
        $defaults = [
            'user_id' => $this->user->id,
            'word_count' => $data['word_count'] ?? 0,
            'character_count' => $data['character_count'] ?? 0,
            'content' => $data['content'] ?? '',
            'content_markdown' => $data['content_markdown'] ?? $data['content'] ?? '',
            'synopsis' => $data['synopsis'] ?? '',
            'item_order' => $data['item_order'] ?? 0,
            'include_in_compile' => $data['include_in_compile'] ?? true,
            'parent_id' => $data['parent_id'] ?? null,
            'folder_type' => $data['folder_type'] ?? null,
            'created_at' => now()->subDays(rand(1, 30)),
            'updated_at' => now()->subDays(rand(0, 7)),
        ];

        return Item::create(array_merge($defaults, $data));
    }
}