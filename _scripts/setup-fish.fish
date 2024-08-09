#!/bin/fish

source ./dev/fish-plugins/fisher/functions/fisher.fish

for file in ./dev/fish-plugins/*
	fisher install $file
end

tide configure --auto --style=Lean --prompt_colors='True color' --show_time='24-hour format' --lean_prompt_height='One line' --prompt_spacing=Compact --icons='Few icons' --transient=No

cp ./dev/functions.fish ~/.config/fish/functions/functions.fish

defnew g=git
defnew gp=git push
defnew gl=git pull