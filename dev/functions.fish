function fish_greeting
	echo "Hey man"
end

# todo: better greetings, various aliases, etcs.

# read function
function funcread
	cat ~/.config/fish/functions/$argv[1].fish
end

# create a new alias and permanently save it
function defnew
	alias --save "$argv"
end

# delete an alias permanently
function funcdel
	if test -e ~/.config/fish/functions/$argv[1].fish
		rm ~/.config/fish/functions/$argv[1].fish
		echo "Deleted $argv[1]."
	else
		echo "$argv[1] doesn't exist."
	end
end
