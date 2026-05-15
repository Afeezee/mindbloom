insert into public.stories (
  id,
  user_id,
  title,
  content,
  prompt_used,
  age_group,
  theme,
  characters,
  word_count,
  cover_image_url,
  is_public
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'seed-clerk-user',
    'Luna and the Lantern Lake',
    'Luna loved the soft blue glow that danced across Lantern Lake every evening. One night, when the lantern fish drifted farther from shore than ever before, she followed their light in a tiny wooden boat.\n\nIn the middle of the lake, Luna found a sleeping island covered in folded paper flowers. She whispered a hello, and the flowers opened one by one, each holding a memory from someone in the village who had once needed courage. Luna chose one memory for herself and tucked it close to her heart.\n\nWhen she rowed home, Luna discovered she could share that courage too. She spent the next morning helping her neighbors try things they had been afraid to do, and Lantern Lake shimmered brighter than it ever had before.',
    'Theme: Fantasy. Age group: 6-8. Main character: Luna. Setting: Lantern Lake. Include this special element: paper flowers filled with courage.',
    '6-8',
    'Fantasy',
    array['Luna', 'Lantern fish'],
    152,
    null,
    true
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'seed-clerk-user',
    'Professor Pebble''s Pocket Volcano',
    'Professor Pebble was the smallest rock scientist in Mossy Meadow, and that made him the most determined. One spring morning he discovered a warm, fizzing pebble that hummed whenever someone asked a big question.\n\nInstead of keeping it to himself, Professor Pebble rolled it through the meadow so every young animal could take a turn wondering. Each question made the pebble glow a new color, and together they built a tiny model volcano that puffed out mint-scented steam instead of smoke.\n\nBy sunset, everyone in Mossy Meadow knew that science felt less scary when curiosity was shared. Professor Pebble tucked the fizzing pebble into his pocket and smiled all the way home.',
    'Theme: Science. Age group: 9-12. Main character: Professor Pebble. Setting: Mossy Meadow. Include this special element: a fizzing question pebble.',
    '9-12',
    'Science',
    array['Professor Pebble', 'Mossy Meadow animals'],
    154,
    null,
    false
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'seed-clerk-user',
    'Milo and the Raincoat Parade',
    'Milo worried whenever the sky turned gray, because rain meant canceled games and quiet windows. But Grandma stitched him a sun-yellow raincoat with pockets deep enough for treasures and told him every rainy day hides a parade if you know how to look.\n\nSo Milo stepped outside and listened. Raindrops drummed on mailboxes, puddles flashed silver ribbons, and the neighborhood children marched beside him in boots that splashed like cymbals. Even the sparrows bounced along the fence as if they had practiced the route all week.\n\nBy the time the clouds moved on, Milo no longer saw rainy days as ruined days. He saw them as invitations to notice a different kind of music.',
    'Theme: Friendship. Age group: 3-5. Main character: Milo. Setting: a rainy neighborhood street. Include this special element: a bright yellow raincoat.',
    '3-5',
    'Friendship',
    array['Milo', 'Grandma'],
    152,
    null,
    true
  )
on conflict (id) do nothing;
