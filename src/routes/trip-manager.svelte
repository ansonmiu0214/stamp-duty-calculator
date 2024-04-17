<script lang="ts">
	import { computeOverlap, hasOverlap, type Trip } from '$lib/triplib';
	import * as D from '$lib/datelib';
	import type { Eligibility } from '$lib/eligibility-calculator';

	import type { DateRange } from 'bits-ui';
	import { DateFormatter, getLocalTimeZone, type DateValue } from '@internationalized/date';

	// components

	import XCircle from 'lucide-svelte/icons/x-circle';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import * as Alert from '$lib/components/ui/alert';

	import { cn } from '$lib/utils';
	import { RangeCalendar } from '$lib/components/ui/range-calendar';
	import * as Popover from '$lib/components/ui/popover';

	const df = new DateFormatter('en-US', {
		dateStyle: 'medium'
	});

	let newTripRange: DateRange | undefined = undefined;
	// 	start: new CalendarDate(2022, 1, 20),
	// 	end: new CalendarDate(2022, 1, 20).add({ days: 20 })
	// };

	let newTripStart: DateValue | undefined = undefined;

	export let trips: Trip[];
	export let eligibility: Eligibility | undefined;

	const addTrip = () => {
		trips = [
			...trips,
			{
				startDate: newTripRange!.start!.toDate(getLocalTimeZone())!,
				endDate: newTripRange!.end!.toDate(getLocalTimeZone())!!
			}
		].toSorted((trip1, trip2) => trip1.startDate.getTime() - trip2.startDate.getTime());

		newTripStart = undefined;
		newTripRange = undefined;
	};

	const deleteTrip = (tripIdxToDelete: number) => () => {
		trips = trips.filter((_, tripIdx) => tripIdx !== tripIdxToDelete);
	};

	const deriveError = (startDate: Date | undefined, endDate: Date | undefined, trips: Trip[]) => {
		if (startDate === undefined || endDate === undefined) {
			return undefined;
		}

		if (startDate.getTime() > endDate.getTime()) {
			return `start date (${D.renderDate(startDate)}) is later than end date (${D.renderDate(endDate)})`;
		}

		for (const trip of trips) {
			if (hasOverlap(trip, { startDate, endDate })) {
				return `new trip [${D.renderDate(startDate)}..${D.renderDate(endDate)}] overlaps with existing trip [${D.renderDate(trip.startDate)}..${D.renderDate(trip.endDate)}]`;
			}
		}

		return undefined;
	};

	$: error = deriveError(
		newTripRange?.start?.toDate(getLocalTimeZone()),
		newTripRange?.end?.toDate(getLocalTimeZone()),
		trips
	);
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head class="text-center">Start Date</Table.Head>
			<Table.Head class="text-center">End Date</Table.Head>
			<Table.Head class="text-center">Number of days</Table.Head>
			{#if eligibility != undefined}
				<Table.Head>Number of <strong>valid</strong> days</Table.Head>
			{/if}
			<Table.Head>&nbsp;</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each trips as trip, i (i)}
			<Table.Row>
				<Table.Cell class="text-center">{D.renderDate(trip.startDate)}</Table.Cell>
				<Table.Cell class="text-center">{D.renderDate(trip.endDate)}</Table.Cell>
				<Table.Cell class="text-center">{D.daysBetween(trip.startDate, trip.endDate)}</Table.Cell>

				{#if eligibility != undefined}
					<Table.Cell
						class="text-center"
					>{computeOverlap(trip, {
							startDate: eligibility.windowStartDate,
							endDate: eligibility.windowEndDate
						})}</Table.Cell
					>
				{/if}
				<Table.Cell class="text-right">
					<Button on:click={deleteTrip(i)} variant="outline" size="icon">
						<XCircle class="h-4 w-4" />
					</Button>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>

<hr />

{#if error !== undefined}
<Alert.Root variant="destructive">
	<AlertCircle class="h-4 w-4" />
	<Alert.Title>Error</Alert.Title>
	<Alert.Description
	  >{error}</Alert.Description
	>
  </Alert.Root>
{/if}

<div class="py-2">
	<Popover.Root openFocus>
		<Popover.Trigger asChild let:builder>
			<Button
				variant="outline"
				class={cn(
					'w-[300px] justify-start text-left font-normal',
					!newTripRange && 'text-muted-foreground'
				)}
				builders={[builder]}
			>
				<CalendarIcon class="mr-2 h-4 w-4" />
				{#if newTripRange && newTripRange.start}
					{#if newTripRange.end}
						{df.format(newTripRange.start.toDate(getLocalTimeZone()))} - {df.format(
							newTripRange.end.toDate(getLocalTimeZone())
						)}
					{:else}
						{df.format(newTripRange.start.toDate(getLocalTimeZone()))}
					{/if}
				{:else if newTripStart}
					{df.format(newTripStart.toDate(getLocalTimeZone()))}
				{:else}
					New trip
				{/if}
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-auto p-0" align="start">
			<RangeCalendar
				bind:value={newTripRange}
				bind:startValue={newTripStart}
				initialFocus
				numberOfMonths={2}
				placeholder={newTripRange?.start}
			/>
		</Popover.Content>
	</Popover.Root>
	
	<Button
		disabled={newTripRange === undefined ||
			newTripRange.start === undefined ||
			newTripRange.end === undefined ||
			error !== undefined}
		on:click={addTrip}
	>
		Add Trip
	</Button>
</div>
