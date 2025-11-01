<script lang="ts">
	import type { Project } from '$lib/remote/api';

	let {
		show = $bindable(false),
		onclose,
		onsubmit
	}: {
		show?: boolean;
		onclose?: () => void;
		onsubmit?: (event: { project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> }) => void;
	} = $props();

	function handleClose() {
		show = false;
		onclose?.();
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		onsubmit?.({
			project: {
				name: formData.get('name') as string,
				repoUrl: formData.get('repoUrl') as string,
				type: formData.get('type') as 'ink-contract' | 'dapp',
				framework: formData.get('framework') as string,
				branch: formData.get('repoBranch') as string
			}
		});

		form.reset();
		handleClose();
	}

	// Handle clicking outside the modal to close it
	function handleBackdropClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('modal-backdrop')) {
			handleClose();
		}
	}

	// Handle escape key to close modal
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-transparent modal-backdrop backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div class="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-semibold">Create New Project</h2>
				<!-- svelte-ignore a11y_consider_explicit_label -->
				<button
					type="button"
					class="text-gray-400 cursor-pointer hover:text-gray-600"
					onclick={handleClose}
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<form onsubmit={handleSubmit} class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700">Project Name</label>
					<input
						type="text"
						name="name"
						id="name"
						required
						class="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
						placeholder="My Awesome Project"
					/>
				</div>

				<div>
					<label for="repoUrl" class="block text-sm font-medium text-gray-700">Repository URL</label
					>
					<input
						type="url"
						name="repoUrl"
						id="repoUrl"
						required
						class="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
						placeholder="https://github.com/username/repo"
					/>
				</div>

				<div>
					<label for="repoBranch" class="block text-sm font-medium text-gray-700">Repository Branch</label
					>
					<input
						type="text"
						name="repoBranch"
						id="repoBranch"
						required
						class="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
						placeholder="main"
					/>
				</div>

				<div>
					<label for="type" class="block text-sm font-medium text-gray-700">Project Type</label>
					<select
						name="type"
						id="type"
						required
						class="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					>
						<option value="">Select Type</option>
						<option value="ink-contract">ink! Contract</option>
						<option value="dapp">dApp</option>
					</select>
				</div>

				<div>
					<label for="framework" class="block text-sm font-medium text-gray-700"
						>Framework (for dApps)</label
					>
					<select
						name="framework"
						id="framework"
						class="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					>
						<option value="">Select Framework</option>
						<option value="vite">Vite</option>
						<option value="nextjs">Next.js</option>
						<option value="svelte">SvelteKit</option>
					</select>
				</div>

				<div class="flex justify-end mt-6 space-x-3">
					<button
						type="button"
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
						onclick={handleClose}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						Create
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}