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
    python311Packages.python
    python311Packages.pip
    python311Packages.transformers
    python311Packages.torch
    python311Packages.sentence-transformers
  ];
}
