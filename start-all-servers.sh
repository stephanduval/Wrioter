#!/bin/bash
ssh sduval@192.168.1.252 "cd ~/Code/Wrioter && tmux new-session -d -s Wrioter 'yarn dev:test:all'"
ssh sduval@192.168.1.252 "cd ~/Code/Wrioter\ Branch\ 2 && tmux new-session -d -s Wrioter-Branch-2 'yarn dev:branch2:all'"
ssh sduval@192.168.1.252 "cd ~/Code/Wrioter\ Branch\ 3 && tmux new-session -d -s Wrioter-Branch-3 'yarn dev:branch3:all'"
