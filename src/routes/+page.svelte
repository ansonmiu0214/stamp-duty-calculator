<script lang="ts">
	import { optimalRefundEligibility } from '$lib/eligibility-calculator';
	import type { Trip } from '$lib/triplib';
	import * as D from '$lib/datelib';
	import TripManager from './trip-manager.svelte';

	// components
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { type DateValue, DateFormatter, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let completionDate: DateValue | undefined = undefined;

	// let completionDate: Date | null = null;
	let trips: Trip[] = [
		{ startDate: new Date(2023, 6 - 1, 9), endDate: new Date(2023, 8 - 1, 11) },
		{ startDate: new Date(2023, 12 - 1, 1), endDate: new Date(2024, 1 - 1, 31) },
		{ startDate: new Date(2024, 5 - 1, 24), endDate: new Date(2024, 6 - 1, 17) }
	];

	$: eligibility =
		completionDate !== undefined
			? optimalRefundEligibility(completionDate.toDate(getLocalTimeZone()), trips)
			: undefined;
</script>

<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
	UK Overseas Stamp Duty Refund Eligibility Calculator
</h1>

<Popover.Root>
	<Popover.Trigger asChild let:builder>
		<Button
			variant="outline"
			class={cn(
				'w-[280px] justify-start text-left font-normal',
				!completionDate && 'text-muted-foreground'
			)}
			builders={[builder]}
		>
			<CalendarIcon class="mr-2 h-4 w-4" />
			{completionDate ? df.format(completionDate.toDate(getLocalTimeZone())) : 'Completion date'}
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0">
		<Calendar bind:value={completionDate} initialFocus />
	</Popover.Content>
</Popover.Root>

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
