function rgb
	function hextorgb
		set r $(string sub $argv[1] -l 2)
		set g $(string sub $argv[1] -l 2 -s 2)
		set b $(string sub $argv[1] -l 2 -s 4)

		set r $(python3 -c "print(int(\"$r\", 16))")
		set g $(python3 -c "print(int(\"$g\", 16))")
		set b $(python3 -c "print(int(\"$b\", 16))")

		string join ';' $r $g $b
	end

	printf "\033[38;2;%sm" $(hextorgb $argv[2])
	
	if test (count $argv) -eq 3
		printf "\033[48;2;%sm" $(hextorgb $argv[3])
	end

	printf "%s" $argv[1]
	printf "\033[0m"
end

function fish_greeting
	echo "Welcome to $(rgb "Tachi" e61c6e 0000ff)!"
	echo ""
	echo "Type $(rgb "just start" ffffff 000000) to start up the frontend and backend."
	echo "Type $(rgb "just" ffffff 000000) to see all of Tachi's scripts."
	echo ""
	echo "If you're looking to run some seeds scripts, try out $(rgb "just seeds" ffffff 000000)."
	echo "Thank you for showing up and contributing! Feel free to reach out if you need anything."
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
