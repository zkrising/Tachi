#!/bin/fish

# add a local bin for ts-node
fish_add_path ~/.local/pnpm
fish_add_path /tachi/node_modules/.bin

source ./dev/fish-plugins/fisher/functions/fisher.fish

for file in ./dev/fish-plugins/*
	fisher install $file
end

tide configure --auto --style=Lean --prompt_colors='True color' --show_time='24-hour format' --lean_prompt_height='One line' --prompt_spacing=Compact --icons='Few icons' --transient=No

cp ./dev/functions.fish ~/.config/fish/functions/functions.fish
source ./dev/functions.fish

# define new permanent aliases here...
source ./dev/aliases.fish

# rr