{
	inputs = {
		nixpkgs.url = "github:nixos/nixpkgs";
		flake-utils.url = "github:numtide/flake-utils";
	};
	outputs = { self, nixpkgs, flake-utils }:
		flake-utils.lib.eachDefaultSystem (system:
			let 
				pkgs = nixpkgs.legacyPackages.${system};
      in {
				devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
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
				};
      }
		);
}
