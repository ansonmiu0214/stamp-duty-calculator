<script lang="ts">
	import { optimalRefundEligibility } from '$lib/eligibility-calculator';
	import type { Trip } from '$lib/triplib';
	import * as D from '$lib/datelib';
	import TripManager from './trip-manager.svelte';

	let completionDate: Date | null = null;
	let trips: Trip[] = [
		{ startDate: new Date(2023, 6 - 1, 9), endDate: new Date(2023, 8 - 1, 11) },
		{ startDate: new Date(2023, 12 - 1, 1), endDate: new Date(2024, 1 - 1, 31) },
		{ startDate: new Date(2024, 5 - 1, 24), endDate: new Date(2024, 6 - 1, 17) }
	];

	$: eligibility =
		completionDate !== null ? optimalRefundEligibility(completionDate, trips) : undefined;
</script>

<h1>UK Overseas Stamp Duty Refund Eligibility Calculator</h1>

<label for="completion-date">Completion date:</label>
<input
	name="completion-date"
	type="date"
	on:change={(ev) => (completionDate = ev.currentTarget.valueAsDate)}
/>

<TripManager bind:trips {eligibility} />

{#if eligibility !== undefined}
	{#if eligibility.result === 'yes, immediately!'}
		<h1>Eligibility: {eligibility.result}</h1>

		{D.renderDate(eligibility.windowStartDate)} to {D.renderDate(eligibility.windowEndDate)}
	{:else if eligibility.result === 'no, but possible!'}
		<h1>Eligibility: {eligibility.result}</h1>

		{D.renderDate(eligibility.windowStartDate)} to {D.renderDate(eligibility.windowEndDate)}

		<p>
			Missing {eligibility.numDaysMissing} days, between the end of your last trip ({D.renderDate(
				eligibility.latestTrip.endDate
			)}) and the window ({D.renderDate(eligibility.windowEndDate)})
		</p>
	{:else}
		<h1>Eligibility: {eligibility.result}</h1>

		{D.renderDate(eligibility.windowStartDate)} to {D.renderDate(eligibility.windowEndDate)}

		<p>
			Only yields of a maximum of {eligibility.numValidDays} valid days
		</p>
	{/if}
{/if}
