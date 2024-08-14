function rgb
	function hextorgb
		set r $(string sub $argv[1] -l 2)
		set g $(string sub $argv[1] -l 2 -s 3)
		set b $(string sub $argv[1] -l 2 -s 5)

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

function cmd
	rgb $argv[1] e61c6e 000000
end



function fish_greeting
	echo "Welcome to $(rgb "Tachi" e61c6e 131313)!"

	if ! test -e ~/.config/fish/NO_GREET
		echo ""
		echo $(rgb "This terminal is set up inside a Linux Machine!" 007700 000000)
		echo $(rgb "This machine comes pre-installed with Tachi and helpful tools." 007700 000000)
		echo ""
		echo "Type $(cmd "just start") to start up a frontend and backend."
		echo "Type $(cmd "just seeds run") to run seeds scripts."
		echo "Type $(cmd "just") to see all of Tachi's scripts."
		echo ""
		echo "$(rgb "Thank you for showing up and contributing!" 832700 000000) Feel free to reach out if you need anything."
		echo "To turn off this long message, run $(cmd "disable_greeting")"
	end
end

function disable_greeting
	touch ~/.config/fish/NO_GREET
	echo "Greeting disabled. Run $(cmd "enable_greeting") to turn it back on."
end

function enable_greeting
	rm ~/.config/fish/NO_GREET
	echo "Greeting enabled!"
end

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
