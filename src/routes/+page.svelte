<script lang="ts">
	import { optimalRefundEligibility } from '$lib/eligibility-calculator';
	import type { Trip } from '$lib/triplib';
	import * as D from '$lib/datelib';
	import TripManager from './trip-manager.svelte';

	// components
	import * as Alert from "$lib/components/ui/alert";
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { type DateValue, DateFormatter, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let completionDate: DateValue | undefined;

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

<div class="container">
	<h1 class="text-center scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
		UK Overseas Stamp Duty Refund Eligibility Calculator
	</h1>
	
	<div class="mt-5 mb-2">
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
	</div>
	
	<TripManager bind:trips {eligibility} />

	{#if eligibility !== undefined}
		{#if eligibility.result === 'yes, immediately!'}
			<Alert.Root>
				<Alert.Title>
					<h2 class="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
						Good news, you are already eligible!
					</h2>
				</Alert.Title>
				<Alert.Description>
					{D.renderDate(eligibility.windowStartDate)} to {D.renderDate(eligibility.windowEndDate)}
				</Alert.Description>
			</Alert.Root>
		{:else if eligibility.result === 'no, but possible!'}
			<Alert.Root>
				<Alert.Title>
					<h2 class="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
						You are not eligible yet, but <strong>could be</strong> with extra stays.
					</h2>
				</Alert.Title>
				<Alert.Description>
					<ul>
						<li>
							Window: {D.renderDate(eligibility.windowStartDate)} to {D.renderDate(eligibility.windowEndDate)}
						</li>
						<li>
							You need to stay for <strong>at least {eligibility.numDaysMissing} days</strong>
							between the end of your latest valid trip ({D.renderDate(eligibility.latestTrip.endDate)})
							and the window end date ({D.renderDate(eligibility.windowEndDate)}).
						</li>
					</ul>
				</Alert.Description>
			</Alert.Root>
		{:else}
			<Alert.Root variant="destructive">
				<Alert.Title>
					<h2 class="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
						You will never be eligible.
					</h2>
				</Alert.Title>
				<Alert.Description>
					<ul>
						<li>
							Window: {D.renderDate(eligibility.windowStartDate)} to {D.renderDate(eligibility.windowEndDate)}
						</li>
						<li>
							This is the maximal window based on your
							existing trips and the completion date,
							which only yields a maximum of
							{eligibility.numValidDays} valid days.
						</li>
						<li>
							There is not enough days between
							the end of your latest valid trip
							and the window end date to cover
							the number of missing days.
						</li>
					</ul>
				</Alert.Description>
			</Alert.Root>
		{/if}
	{/if}
</div>
