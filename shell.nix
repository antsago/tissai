let
  nixpkgs = fetchTarball "https://github.com/NixOS/nixpkgs/tarball/nixos-23.11";
  pkgs = import nixpkgs { config = {}; overlays = []; };
in

pkgs.mkShell {
  packages = with pkgs; [
    vim
    postgresql
    unixtools.ping

    nodejs_20
    yarn
    python3
    poetry
  ];

  # fixes libstdc++ and libgl.so issues
  LD_LIBRARY_PATH = "${pkgs.stdenv.cc.cc.lib}/lib";
}
