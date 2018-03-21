1) Copy files in serverinfo/ to ~/serverinfobot/ and run npm install
2) npm install -g nodemon
3) Copy .service file into ~/.config/systemd/user/
4) run systemctl --user enable --now serverinfo
5) run systemctl --user start serverinfo