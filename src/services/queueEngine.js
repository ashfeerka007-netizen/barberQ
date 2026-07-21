// BarberQ Pro - Queue Calculation & Math Engine

/**
 * Calculates estimated wait times, start times, and finish times for every item in the queue.
 * @param {Array} queue - Array of queue items
 * @param {number} bufferMinutes - Optional buffer time between customers in minutes (default 5)
 * @returns {Array} Updated queue array with computed timestamps
 */
export const calculateQueueTimings = (queue = [], bufferMinutes = 5) => {
  const now = new Date();
  
  // Separate into In Service and Waiting items
  let activeServing = queue.filter(item => item.status === 'In Service');
  let waitingList = queue.filter(item => item.status === 'Waiting');
  let completedOrSkipped = queue.filter(item => item.status === 'Completed' || item.status === 'Skipped');

  // Sort waiting list so VIP / Priority items come first, preserving original order otherwise
  waitingList.sort((a, b) => {
    if (a.is_priority && !b.is_priority) return -1;
    if (!a.is_priority && b.is_priority) return 1;
    return 0; // maintain relative position
  });

  // Calculate cumulative remaining time for currently serving customer
  let totalWaitBeforeNext = 0;

  if (activeServing.length > 0) {
    const currentItem = activeServing[0];
    const startedAt = currentItem.started_at ? new Date(currentItem.started_at) : now;
    const elapsedMinutes = Math.max(0, (now.getTime() - startedAt.getTime()) / (1000 * 60));
    const remainingMinutes = Math.max(0, currentItem.total_duration - elapsedMinutes);
    
    // Attach computed properties to serving item
    currentItem.elapsed_minutes = Math.floor(elapsedMinutes);
    currentItem.remaining_minutes = Math.ceil(remainingMinutes);
    currentItem.estimated_start = currentItem.started_at;
    
    const expectedFinishDate = new Date(startedAt.getTime() + currentItem.total_duration * 60 * 1000);
    currentItem.estimated_finish = expectedFinishDate.toISOString();

    totalWaitBeforeNext = remainingMinutes + bufferMinutes;
  }

  // Iterate over waiting items and assign dynamic estimated start & finish times
  let currentAccumulatedWait = totalWaitBeforeNext;

  const updatedWaitingList = waitingList.map(item => {
    const estStart = new Date(now.getTime() + currentAccumulatedWait * 60 * 1000);
    const estFinish = new Date(estStart.getTime() + item.total_duration * 60 * 1000);

    const computedItem = {
      ...item,
      estimated_wait_minutes: Math.ceil(currentAccumulatedWait),
      estimated_start: estStart.toISOString(),
      estimated_finish: estFinish.toISOString()
    };

    // Increment accumulated wait for subsequent customer in line
    currentAccumulatedWait += item.total_duration + bufferMinutes;

    return computedItem;
  });

  // Combine back into unified queue maintaining active -> waiting -> completed/skipped
  return [...activeServing, ...updatedWaitingList, ...completedOrSkipped];
};

/**
 * Calculates Total Duration and Total Price from a list of selected service objects
 */
export const calculateServicesTotal = (selectedServices = []) => {
  const totalDuration = selectedServices.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  return { totalDuration, totalPrice };
};

/**
 * Calculates dynamic estimation for a prospective NEW customer joining the queue
 */
export const estimateNewCustomerTimes = (queue = [], newCustomerServices = [], bufferMinutes = 5) => {
  const { totalDuration, totalPrice } = calculateServicesTotal(newCustomerServices);
  const now = new Date();

  // Find total remaining duration of currently serving + all waiting customers
  let currentWaitMinutes = 0;

  const activeServing = queue.find(item => item.status === 'In Service');
  if (activeServing) {
    const startedAt = activeServing.started_at ? new Date(activeServing.started_at) : now;
    const elapsedMinutes = Math.max(0, (now.getTime() - startedAt.getTime()) / (1000 * 60));
    const remainingMinutes = Math.max(0, activeServing.total_duration - elapsedMinutes);
    currentWaitMinutes += remainingMinutes + bufferMinutes;
  }

  const waitingCustomers = queue.filter(item => item.status === 'Waiting');
  waitingCustomers.forEach(item => {
    currentWaitMinutes += item.total_duration + bufferMinutes;
  });

  const estimatedStart = new Date(now.getTime() + currentWaitMinutes * 60 * 1000);
  const estimatedFinish = new Date(estimatedStart.getTime() + totalDuration * 60 * 1000);

  return {
    total_duration: totalDuration,
    total_price: totalPrice,
    estimated_wait_minutes: Math.ceil(currentWaitMinutes),
    estimated_start: estimatedStart.toISOString(),
    estimated_finish: estimatedFinish.toISOString()
  };
};

/**
 * Helper to reorder queue items
 */
export const moveQueueItem = (queue = [], index, direction) => {
  const newQueue = [...queue];
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= newQueue.length) return queue;
  
  const temp = newQueue[index];
  newQueue[index] = newQueue[targetIndex];
  newQueue[targetIndex] = temp;
  
  return calculateQueueTimings(newQueue);
};
