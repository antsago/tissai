
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const NIX_CC: string;
	export const NIX_BINTOOLS_WRAPPER_TARGET_HOST_aarch64_unknown_linux_gnu: string;
	export const patches: string;
	export const _PYTHON_SYSCONFIGDATA_NAME: string;
	export const USER: string;
	export const npm_config_user_agent: string;
	export const PYTHONHASHSEED: string;
	export const GIT_EDITOR: string;
	export const HOSTNAME: string;
	export const stdenv: string;
	export const GIT_ASKPASS: string;
	export const OBJCOPY: string;
	export const npm_node_execpath: string;
	export const TEMPDIR: string;
	export const SIZE: string;
	export const SHLVL: string;
	export const BROWSER: string;
	export const HOME: string;
	export const outputs: string;
	export const OLDPWD: string;
	export const NIX_BUILD_CORES: string;
	export const TERM_PROGRAM_VERSION: string;
	export const propagatedNativeBuildInputs: string;
	export const VSCODE_IPC_HOOK_CLI: string;
	export const npm_package_json: string;
	export const depsHostHost: string;
	export const buildInputs: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const NODE_OPTIONS: string;
	export const STRINGS: string;
	export const builder: string;
	export const NIX_PROFILES: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const SSL_CERT_FILE: string;
	export const COLORTERM: string;
	export const PYTHONNOUSERSITE: string;
	export const NIX_ENFORCE_NO_NATIVE: string;
	export const REMOTE_CONTAINERS: string;
	export const doInstallCheck: string;
	export const mesonFlags: string;
	export const TMPDIR: string;
	export const out: string;
	export const STRIP: string;
	export const REMOTE_CONTAINERS_IPC: string;
	export const strictDeps: string;
	export const NIX_BINTOOLS: string;
	export const cmakeFlags: string;
	export const TEMP: string;
	export const propagatedBuildInputs: string;
	export const _: string;
	export const READELF: string;
	export const depsBuildBuild: string;
	export const AR: string;
	export const NIX_CFLAGS_COMPILE: string;
	export const PROMPT_DIRTRIM: string;
	export const IN_NIX_SHELL: string;
	export const enableParallelChecking: string;
	export const TERM: string;
	export const AS: string;
	export const depsBuildTarget: string;
	export const _PYTHON_HOST_PLATFORM: string;
	export const PATH: string;
	export const depsTargetTarget: string;
	export const system: string;
	export const npm_package_name: string;
	export const NIX_CC_WRAPPER_TARGET_HOST_aarch64_unknown_linux_gnu: string;
	export const SOURCE_DATE_EPOCH: string;
	export const REMOTE_CONTAINERS_SOCKETS: string;
	export const LANG: string;
	export const NIX_LDFLAGS: string;
	export const LS_COLORS: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const TMP: string;
	export const TERM_PROGRAM: string;
	export const SSH_AUTH_SOCK: string;
	export const SYSTEM_CERTIFICATE_PATH: string;
	export const NIX_BUILD_TOP: string;
	export const passAsFile: string;
	export const NIX_HARDENING_ENABLE: string;
	export const depsHostHostPropagated: string;
	export const PROJECT_CWD: string;
	export const SHELL: string;
	export const doCheck: string;
	export const npm_package_version: string;
	export const npm_lifecycle_event: string;
	export const CXX: string;
	export const NIX_STORE: string;
	export const NIX_SSL_CERT_FILE: string;
	export const __structuredAttrs: string;
	export const CONFIG_SHELL: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const name: string;
	export const PWD: string;
	export const enableParallelInstalling: string;
	export const HOST_PATH: string;
	export const BERRY_BIN_FOLDER: string;
	export const npm_execpath: string;
	export const LD: string;
	export const XDG_DATA_DIRS: string;
	export const depsBuildBuildPropagated: string;
	export const PYTHONPATH: string;
	export const DETERMINISTIC_BUILD: string;
	export const configureFlags: string;
	export const shell: string;
	export const enableParallelBuilding: string;
	export const CC: string;
	export const depsBuildTargetPropagated: string;
	export const RANLIB: string;
	export const nativeBuildInputs: string;
	export const buildCommandPath: string;
	export const depsTargetTargetPropagated: string;
	export const NM: string;
	export const OBJDUMP: string;
	export const INIT_CWD: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/master/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		NIX_CC: string;
		NIX_BINTOOLS_WRAPPER_TARGET_HOST_aarch64_unknown_linux_gnu: string;
		patches: string;
		_PYTHON_SYSCONFIGDATA_NAME: string;
		USER: string;
		npm_config_user_agent: string;
		PYTHONHASHSEED: string;
		GIT_EDITOR: string;
		HOSTNAME: string;
		stdenv: string;
		GIT_ASKPASS: string;
		OBJCOPY: string;
		npm_node_execpath: string;
		TEMPDIR: string;
		SIZE: string;
		SHLVL: string;
		BROWSER: string;
		HOME: string;
		outputs: string;
		OLDPWD: string;
		NIX_BUILD_CORES: string;
		TERM_PROGRAM_VERSION: string;
		propagatedNativeBuildInputs: string;
		VSCODE_IPC_HOOK_CLI: string;
		npm_package_json: string;
		depsHostHost: string;
		buildInputs: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		NODE_OPTIONS: string;
		STRINGS: string;
		builder: string;
		NIX_PROFILES: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		SSL_CERT_FILE: string;
		COLORTERM: string;
		PYTHONNOUSERSITE: string;
		NIX_ENFORCE_NO_NATIVE: string;
		REMOTE_CONTAINERS: string;
		doInstallCheck: string;
		mesonFlags: string;
		TMPDIR: string;
		out: string;
		STRIP: string;
		REMOTE_CONTAINERS_IPC: string;
		strictDeps: string;
		NIX_BINTOOLS: string;
		cmakeFlags: string;
		TEMP: string;
		propagatedBuildInputs: string;
		_: string;
		READELF: string;
		depsBuildBuild: string;
		AR: string;
		NIX_CFLAGS_COMPILE: string;
		PROMPT_DIRTRIM: string;
		IN_NIX_SHELL: string;
		enableParallelChecking: string;
		TERM: string;
		AS: string;
		depsBuildTarget: string;
		_PYTHON_HOST_PLATFORM: string;
		PATH: string;
		depsTargetTarget: string;
		system: string;
		npm_package_name: string;
		NIX_CC_WRAPPER_TARGET_HOST_aarch64_unknown_linux_gnu: string;
		SOURCE_DATE_EPOCH: string;
		REMOTE_CONTAINERS_SOCKETS: string;
		LANG: string;
		NIX_LDFLAGS: string;
		LS_COLORS: string;
		VSCODE_GIT_IPC_HANDLE: string;
		TMP: string;
		TERM_PROGRAM: string;
		SSH_AUTH_SOCK: string;
		SYSTEM_CERTIFICATE_PATH: string;
		NIX_BUILD_TOP: string;
		passAsFile: string;
		NIX_HARDENING_ENABLE: string;
		depsHostHostPropagated: string;
		PROJECT_CWD: string;
		SHELL: string;
		doCheck: string;
		npm_package_version: string;
		npm_lifecycle_event: string;
		CXX: string;
		NIX_STORE: string;
		NIX_SSL_CERT_FILE: string;
		__structuredAttrs: string;
		CONFIG_SHELL: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		name: string;
		PWD: string;
		enableParallelInstalling: string;
		HOST_PATH: string;
		BERRY_BIN_FOLDER: string;
		npm_execpath: string;
		LD: string;
		XDG_DATA_DIRS: string;
		depsBuildBuildPropagated: string;
		PYTHONPATH: string;
		DETERMINISTIC_BUILD: string;
		configureFlags: string;
		shell: string;
		enableParallelBuilding: string;
		CC: string;
		depsBuildTargetPropagated: string;
		RANLIB: string;
		nativeBuildInputs: string;
		buildCommandPath: string;
		depsTargetTargetPropagated: string;
		NM: string;
		OBJDUMP: string;
		INIT_CWD: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
