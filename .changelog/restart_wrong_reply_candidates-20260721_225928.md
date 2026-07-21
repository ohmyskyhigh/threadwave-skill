# Objective

Make the reply skill restart a manual task when the user rejects its candidate set and supplies a new direction.

# Final Changes

- Defined candidate-stage redo and redraft language as a manual-task restart.
- Close each pending source review from the old discovery batch, verify its skipped status, and remove it from the skill's active review presentation before creating one fresh task with the latest direction and requested count.
- Present the complete source-target list together and accept `approve all` only for that exact displayed set; generated reply and mutation approvals remain per-item.
- Added one focused evaluation case and structural regression test.

# Final Result

Achieved. Wrong candidate batches can be abandoned and recreated at the skill level without changing the harness or scheduler modules, and all approval authority resets for the new task.
