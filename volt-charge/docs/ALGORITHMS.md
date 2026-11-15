# Volt-Charge: Algorithms & Data Structures In-Depth Guide

This document provides a comprehensive technical breakdown of all Data Structures and Algorithms implemented in C++ for the **Volt-Charge** platform.

---

## 1. Circular Queue (FIFO Buffer)

### Theoretical Foundations
A Circular Queue is an array-based linear data structure that operates under the **FIFO (First In, First Out)** service discipline. Unlike a linear queue implemented on a static array where dequeued elements create unusable empty slots at the beginning, a circular queue connects the logical end of the buffer back to the beginning.

### Mathematical Formulation
Given an array `data` of fixed maximum capacity $N = 20$:
- **Enqueue Operation**:
  $$\text{rear} = (\text{rear} + 1) \pmod N$$
  $$\text{data}[\text{rear}] = \text{vehicle}$$
  $$\text{count} = \text{count} + 1$$
- **Dequeue Operation**:
  $$\text{front} = (\text{front} + 1) \pmod N$$
  $$\text{count} = \text{count} - 1$$

### Complexity Analysis
- **Time Complexity**:
  - Enqueue: $O(1)$
  - Dequeue: $O(1)$
  - Peek: $O(1)$
  - IsEmpty / IsFull: $O(1)$
- **Space Complexity**: $O(N)$ contiguous memory buffer.

### Edge Cases Handled in C++
1. **Overflow**: When $\text{count} == N$, enqueue is rejected with an informative error message.
2. **Underflow**: When $\text{count} == 0$, dequeue is safely rejected without memory corruption.
3. **Empty Pointer Invariants**: When the queue is empty, $\text{front} = 0, \text{rear} = -1$.

---

## 2. Haversine Spherical Distance Formula

### Mathematical Formulation
To compute the great-circle distance between user GPS coordinates $(\phi_1, \lambda_1)$ and charging station coordinates $(\phi_2, \lambda_2)$ on a spherical Earth of radius $R = 6371\text{ km}$:

$$\Delta \phi = \frac{(\phi_2 - \phi_1)\pi}{180}, \quad \Delta \lambda = \frac{(\lambda_2 - \lambda_1)\pi}{180}$$

$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos\left(\frac{\phi_1 \pi}{180}\right) \cos\left(\frac{\phi_2 \pi}{180}\right) \sin^2\left(\frac{\Delta \lambda}{2}\right)$$

$$c = 2 \cdot \operatorname{atan2}\left(\sqrt{a}, \sqrt{1 - a}\right)$$

$$d = R \cdot c$$

### Complexity
- **Time Complexity**: $O(1)$ per station evaluation.
- **Nearest Station Scan**: $O(n)$ linear scan to find $\min_{i=1}^n d_i$.
- **Space Complexity**: $O(1)$ auxiliary memory.

---

## 3. Searching Algorithms

### Linear Search
- **Mechanism**: Sequentially scans each record $i \in [0, n-1]$ checking if $\text{station}[i].\text{key} == \text{target}$.
- **Best Case**: $O(1)$ (target at index 0).
- **Average Case**: $O(n/2) \implies O(n)$.
- **Worst Case**: $O(n)$ (target at last index or absent).
- **Space Complexity**: $O(1)$.

### Binary Search
- **Pre-requisite**: Array must be sorted by the search field (e.g., station ID or name).
- **Mechanism**: Calculates $\text{mid} = \lfloor (\text{low} + \text{high})/2 \rfloor$. If target matches $\text{data}[\text{mid}]$, return. If target is smaller, search left half ($\text{high} = \text{mid} - 1$); otherwise search right half ($\text{low} = \text{mid} + 1$).
- **Best Case**: $O(1)$ (target at root mid).
- **Average / Worst Case**: $O(\log_2 n)$.
- **Space Complexity**: $O(1)$ iterative.

---

## 4. Sorting Algorithms Comparison

### Bubble Sort
Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.
- **Best**: $O(n)$ with early termination flag.
- **Worst / Average**: $O(n^2)$.
- **Swaps**: $O(n^2)$.
- **Space**: $O(1)$.

### Selection Sort
Divides the list into a sorted sublist at the left and unsorted at the right. Repeatedly finds the minimum element from the unsorted sublist and swaps it with the leftmost unsorted element.
- **Best / Average / Worst**: $O(n^2)$.
- **Swaps**: Exactly $O(n)$ swaps (useful when writing to memory is expensive).
- **Space**: $O(1)$.

### Merge Sort
A divide-and-conquer algorithm that divides the array into two halves, recursively sorts them, and merges the two sorted halves.
- **Best / Average / Worst**: $O(n \log n)$ guaranteed.
- **Space**: $O(n)$ auxiliary array buffer.
- **Stability**: Stable.

### Quick Sort
Picks an element as pivot and partitions the array around the picked pivot such that all elements smaller are on left and greater on right.
- **Best / Average**: $O(n \log n)$.
- **Worst Case**: $O(n^2)$ (when pivot is consistently the extreme element).
- **Space**: $O(\log n)$ recursive call stack.
- **Stability**: Unstable.
