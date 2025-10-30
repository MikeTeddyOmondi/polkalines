<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Project } from '$lib/remote/api';

	export let show = false;

	const dispatch = createEventDispatcher<{
		close: void;
		submit: { project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> };
	}>();

	function handleClose() {
		show = false;
		dispatch('close');
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		dispatch('submit', {
			project: {
				name: formData.get('name') as string,
				repoUrl: formData.get('repoUrl') as string,
				type: formData.get('type') as 'ink-contract' | 'dapp',
				framework: formData.get('framework') as string
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

<svelte:window on:keydown={handleKeydown} />

{#if show}
	<div
		class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm"
		on:click={handleBackdropClick}
		on:keydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div class="mx-4 w-full max-w-md rounded-lg bg-white p-6">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Create New Project</h2>
				<button
					type="button"
					class="cursor-pointer text-gray-400 hover:text-gray-600"
					on:click={handleClose}
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<form on:submit={handleSubmit} class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700">Project Name</label>
					<input
						type="text"
						name="name"
						id="name"
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
						placeholder="https://github.com/username/repo"
					/>
				</div>

				<div>
					<label for="type" class="block text-sm font-medium text-gray-700">Project Type</label>
					<select
						name="type"
						id="type"
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					>
						<option value="">Select Framework</option>
						<option value="vite">Vite</option>
						<option value="nextjs">Next.js</option>
						<option value="svelte">SvelteKit</option>
					</select>
				</div>

				<div class="mt-6 flex justify-end space-x-3">
					<button
						type="button"
						class="cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
						on:click={handleClose}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						Create
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
