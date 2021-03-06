$(() => {
	// Setup add artefact button
	$('#DashboardButtonAddArtefact').on('click', (e) => {
		// Show add artefact dialog
		const dialogAddArtefact = document.getElementById('DialogAddArtefact');
		if (dialogAddArtefact) {
			dialogAddArtefact.show();
		}
	});

	/**
	 * Create a jQuery DOM element for a chip, based on an image url and text
	 * @param {*} image The url for the image of the chip
	 * @param {*} text The text to show in the chip
	 */
	function createImageChip(image, text) {
		return $(`
			<div class="chip">
				<img class="chip-image"
					src='${image}'
					alt='${text}' />
				<span class="chip-text">
					${text}
				</span>
			</div>
		`);
	}


	// Setup tag functionality
	$('.tag-button').on('change', (e) => {
		const selectedTags = [];
		$('.tag-button:checked').each((i, el) => {
			selectedTags.push($(el).attr('data-tag'));
		});

		$('.dashboard-individual-artefact').each((i, el) => {
			$(el).css('display', '');
			// If no selected tags show all elements
			if (selectedTags.length >= 0) {
				// Otherwise show only elements with ALL matching tags
				const tagsString = JSON.parse($(el).attr('data-tags'));
				for (let j = 0; j < selectedTags.length; j += 1) {
					if (!tagsString.includes(selectedTags[j])) {
						$(el).css('display', 'none');
					}
				}
			}
		});
	});

	// Setup view artefact buttons
	$('.dashboard-artefact').on('click', (e) => {
		const $button = $(e.target);
		const artefactId = $button.attr('data-artefact-id');
		// Show view artefact dialog
		const dialogViewArtefact = document.getElementById('DialogViewArtefact');
		if (dialogViewArtefact && artefactId) {
			// Reset all view artefact dialog properties
			$('#ArtefactViewName').html('');
			$('#ArtefactViewDescriptionContainer').css('display', 'none');
			$('#ArtefactViewDescription').html('');
			$('#ArtefactViewImage').attr('src', '');
			$('#ArtefactViewImage').attr('alt', '');
			$('#ArtefactViewOwnerImage').attr('src', '');
			$('#ArtefactViewOwnerImage').attr('alt', '');
			$('#ArtefactViewOwnerText').html('');
			$('#ArtefactViewButtonShare').css('display', 'none');
			$('#ArtefactViewViewersContainer').css('display', 'none');
			$('#ArtefactViewViewers').html('');
			$('#ArtefactViewRecipientsContainer').css('display', 'none');
			$('#ArtefactViewRecipients').html('');
			$('#ArtefactViewEditPanel').css('display', 'none');
			$('#ArtefactViewFilesContainer').css('display', 'none');
			$('#ArtefactViewFiles').html('');
			$('#ArtefactViewTagsContainer').css('display', 'none');
			$('#ArtefactViewTags').html('');

			// Create loading dialog
			const loadingDialog = window.dialogManager.createNewLoadingDialog('Loading Artefact');
			loadingDialog.show();
			// Get and show artefact data
			$.get(`/artefact/find/${artefactId}`, (artefact) => {
				loadingDialog.hideAndRemove();
				dialogViewArtefact.show();
				// Get image url and filename
				let imageUrl = '';
				let imageFilename = '';
				if (artefact.images && artefact.images.item) {
					imageUrl = artefact.images.item.url;
					imageFilename = artefact.images.item.filename;
				}

				// Set fields to match artefact properties
				$('#ArtefactViewName').html(artefact.name);
				$('#ArtefactViewDescriptionContainer').css('display', '');
				$('#ArtefactViewDescription').html(artefact.description);
				$('#ArtefactViewImage').attr('src', imageUrl);
				$('#ArtefactViewImage').attr('alt', imageFilename);
				$('#ArtefactViewOwnerImage').attr('src', artefact.owner.display_picture);
				$('#ArtefactViewOwnerImage').attr('alt', artefact.owner.display_name);
				$('#ArtefactViewOwnerText').html(artefact.owner.display_name);
				$('#ArtefactViewButtonShare').css('display', artefact.isOwner ? '' : 'none');
				$('#ArtefactViewEditPanel').css('display', artefact.isOwner ? '' : 'none');

				if (artefact.files && artefact.files.length > 0) {
					$('#ArtefactViewFilesContainer').css('display', '');
					artefact.files.forEach((file) => {
						$(`
						<li>
							<a href="${file.url}" target="_blank">${file.filename}</a>
						</li>
						`).appendTo($('#ArtefactViewFiles'));
					});
				}

				if (artefact.tags && artefact.tags.length > 0) {
					$('#ArtefactViewTagsContainer').css('display', '');
					$('#ArtefactViewTags').html(artefact.tags.join(', '));
				}

				// Add viewer chips
				if (artefact.viewers && artefact.viewers.length > 0) {
					$('#ArtefactViewViewersContainer').css('display', '');
					artefact.viewers.forEach((viewer) => {
						// Create and add a viewer chip to the dialog
						const chipImage = viewer.display_picture;
						const chipName = viewer.display_name;
						$('#ArtefactViewViewers').append(createImageChip(chipImage, chipName));
					});
				}

				// Add recipient chips
				if (artefact.recipients && artefact.recipients.length > 0) {
					$('#ArtefactViewRecipientsContainer').css('display', '');
					artefact.recipients.forEach((recipient) => {
						// Create and add a viewer chip to the dialog
						const chipImage = recipient.display_picture;
						const chipName = recipient.display_name;
						$('#ArtefactViewRecipients').append(createImageChip(chipImage, chipName));
					});
				}

				// Set share button action
				$('#DialogShareArtefactId').val(artefact._id);
				$('#DialogShareArtefactName').html(artefact.name);
				$('#ArtefactViewButtonShare').off('click');
				$('#ArtefactViewButtonShare').on('click', () => {
					dialogViewArtefact.hide();
					// Show share dialog
					const dialogShare = document.getElementById('DialogShareArtefact');
					if (dialogShare) {
						$('#DialogShareSearchResult').html('');
						dialogShare.show();
					}
				});

				// Set edit button action
				$('#ArtefactViewButtonEdit').off('click');
				$('#ArtefactViewButtonEdit').on('click', () => {
					dialogViewArtefact.hide();
					// Show edit artefact dialog
					const dialogEditArtefact = document.getElementById('DialogEditArtefact');
					// Set values in the dialog to match the artefact
					$('#EditArtefactId').val(artefact._id);
					$('#EditArtefactName').val(artefact.name);
					$('#EditArtefactDescription').val(artefact.description);
					$('#EditArtefactImageName').val(imageFilename);
					$('#EditArtefactDeleteId').val(artefact._id);
					$('#EditArtefactTags').val(artefact.tags.join(', '));
					$('#EditArtefactViewersContainer').css('display', 'none');
					$('#EditArtefactRecipientsContainer').css('display', 'none');
					// Create chips to remove viewers
					if (artefact.viewers && artefact.viewers.length > 0) {
						// Reset the viewer chips
						$('#EditArtefactViewersContainer').css('display', '');
						$('#EditArtefactViewers').html('');
						artefact.viewers.forEach((viewer) => {
							// Create and add a viewer chip to the dialog
							const chipImage = viewer.display_picture;
							const chipName = viewer.display_name;
							const chip = createImageChip(chipImage, chipName);
							// Create the delete viewer button
							const chipButton = $(`
							<button class="chip-button chip-button-error">
								<i class="material-icons-outlined">delete</i>
							</button>
							`).appendTo(chip);

							// Setup the delete viewer button action
							chipButton.on('click', () => {
								// Create loading dialog
								const loadingDialogRemoveViewer = window.dialogManager.createNewLoadingDialog(
									`Removing ${viewer.display_name}`,
								);

								loadingDialogRemoveViewer.show();
								$.post('/artefact/share/remove', { viewerId: viewer._id, id: artefactId }, (data) => {
									loadingDialogRemoveViewer.hideAndRemove();
									// Show success dialog
									const messageDialog = window.dialogManager.createNewMessageDialog('Viewer Removed', `
										${viewer.display_name} has been removed as a viewer from this artefact.
									`);

									messageDialog.show();
									// Remove chip
									chip.remove();
									// Hide viewers panel if no viewers
									if ($('#EditArtefactViewers').children().length === 0) {
										$('#EditArtefactViewersContainer').css('display', 'none');
									}
								}).fail((jqXHR, err, data) => {
									loadingDialogRemoveViewer.hideAndRemove();
									// Create an error dialog with the error message
									const errorDialog = window.dialogManager.createNewErrorDialog(`${jqXHR.responseText}`);
									errorDialog.show();
								});
							});

							// Add the created chip to the viewers
							$('#EditArtefactViewers').append(chip);
						});
					}

					// Create chips to remove recipients
					if (artefact.recipients && artefact.recipients.length > 0) {
						// Reset the recipient chips
						$('#EditArtefactRecipientsContainer').css('display', '');
						$('#EditArtefactRecipients').html('');
						artefact.recipients.forEach((recipient) => {
							// Create and add a recipient chip to the dialog
							const chipImage = recipient.display_picture;
							const chipName = recipient.display_name;
							const chip = createImageChip(chipImage, chipName);
							// Create the delete viewer button
							const chipButton = $(`
							<button class="chip-button chip-button-error">
								<i class="material-icons-outlined">delete</i>
							</button>
							`).appendTo(chip);

							// Setup the delete viewer button action
							chipButton.on('click', () => {
								// Create loading dialog
								const loadingDialogRemoveRecipient = window.dialogManager.createNewLoadingDialog(
									`Removing ${recipient.display_name}`,
								);

								loadingDialogRemoveRecipient.show();
								$.post('/artefact/recipient/remove', { recipientId: recipient._id, id: artefactId }, (data) => {
									loadingDialogRemoveRecipient.hideAndRemove();
									// Show success dialog
									const messageDialog = window.dialogManager.createNewMessageDialog('Recipient Removed', `
										${recipient.display_name} has been removed as a recipient from this artefact.
									`);

									messageDialog.show();
									// Remove chip
									chip.remove();
									// Hide viewers panel if no viewers
									if ($('#EditArtefactRecipients').children().length === 0) {
										$('#EditArtefactRecipientsContainer').css('display', 'none');
									}
								}).fail((jqXHR, err, data) => {
									loadingDialogRemoveRecipient.hideAndRemove();
									// Create an error dialog with the error message
									const errorDialog = window.dialogManager.createNewErrorDialog(`${jqXHR.responseText}`);
									errorDialog.show();
								});
							});

							// Add the created chip to the viewers
							$('#EditArtefactRecipients').append(chip);
						});
					}

					// Show the edit artefact dialog, after other fields have been set
					dialogEditArtefact.show();
				});
			}).fail((jqXHR, err, data) => {
				loadingDialog.hideAndRemove();
				// Show error dialog
				const errorDialog = window.dialogManager.createNewErrorDialog(`
					Could not load information for artefact.
				`);

				errorDialog.show();
			});
		}
	});

	/**
	 * Search for users based on the current values of the add viewers dialog,
	 * and populate the results table based on the search results
	 */
	function searchUsers() {
		$('#DialogShareSearchResult').html('');
		// Get search query
		const query = $('#DialogShareInputSearch').val();
		const artefactId = $('#DialogShareArtefactId').val();
		// Create loading dialog
		const loadingDialog = window.dialogManager.createNewLoadingDialog('Searching for Users');
		loadingDialog.show();
		// Make search
		$.get(`/user/search/${query}`, (users) => {
			loadingDialog.hideAndRemove();
			if (users && users.length > 0) {
				// Add table for users
				const searchResult = $('#DialogShareSearchResult');
				const userTable = $('<table class="user-results"></table>').appendTo(searchResult);
				// Add table headings
				$(`
				<thead>
					<tr>
						<th></th>
						<th>Name</th>
						<th></th>
						<th></th>
					</tr>
				</thead>
				`).appendTo(userTable);

				// Add body
				const userBody = $('<tbody></tbody>').appendTo(userTable);
				users.forEach((user) => {
					// Create a row for the result user
					const userRow = $(`
					<tr>
						<td><img class="user-picture" src="${user.display_picture}" alt="${user.display_name}" /></td>
						<td>${user.display_name}</td>
					</tr>
					`).appendTo(userBody);

					const userButtons = $(`
					<td class="flex-horizontal-responsive-small"></td>
					`).appendTo(userRow);

					// Create a button to add the user as a viewer
					const userButton = $(`
					<button class="button" style="margin-left: auto;">Share with User</button>
					`).appendTo(userButtons);

					// Create a button to add the user as a recipient
					const recipientButton = $(`
					<button class="button" style="margin-left: auto;">Add as Recipient</button>
					`).appendTo(userButtons);

					// Setup the add viewer button action
					userButton.on('click', (e) => {
						// Create loading dialog
						const loadingDialogAddViewer = window.dialogManager.createNewLoadingDialog(
							`Adding ${user.display_name}`,
						);

						loadingDialogAddViewer.show();
						$.post('/artefact/share/add', { viewerId: user._id, id: artefactId }, (data) => {
							loadingDialogAddViewer.hideAndRemove();
							// Show a success dialog with the added user's name
							const messageDialog = window.dialogManager.createNewMessageDialog('Viewer Added', `
								${user.display_name} has been added as a viewer for this artefact.
							`);

							messageDialog.show();
						}).fail((jqXHR, err, data) => {
							loadingDialogAddViewer.hideAndRemove();
							// Show an error dialog with the error response
							const errorDialog = window.dialogManager.createNewErrorDialog(`${jqXHR.responseText}`);
							errorDialog.show();
						});
					});

					// Setup the add recipient button action
					recipientButton.on('click', (e) => {
						// Create loading dialog
						const loadingDialogAddRecipient = window.dialogManager.createNewLoadingDialog(
							`Adding ${user.display_name}`,
						);

						loadingDialogAddRecipient.show();
						$.post('/artefact/recipient/add', { recipientId: user._id, id: artefactId }, (data) => {
							loadingDialogAddRecipient.hideAndRemove();
							// Show a success dialog with the added user's name
							const messageDialog = window.dialogManager.createNewMessageDialog('Recipient Added', `
								${user.display_name} has been added as a recipient for this artefact.
							`);

							messageDialog.show();
						}).fail((jqXHR, err, data) => {
							loadingDialogAddRecipient.hideAndRemove();
							// Show an error dialog with the error response
							const errorDialog = window.dialogManager.createNewErrorDialog(`${jqXHR.responseText}`);
							errorDialog.show();
						});
					});
				});
			} else {
				// Create a message explaining that there are no resulst
				const searchResult = $('#DialogShareSearchResult');
				$('<p class="text-error">No results found</p>').appendTo(searchResult);
			}
		}).fail((jqXHR, err, data) => {
			loadingDialog.hideAndRemove();
			// Show an error dialog with the error response
			const errorDialog = window.dialogManager.createNewErrorDialog(`${jqXHR.responseText}`);
			errorDialog.show();
		});
	}

	// Setup search on enter in input search
	$('#DialogShareInputSearch').on('keydown', (e) => {
		if (e.key === 'Enter') {
			searchUsers();
		}
	});

	// Setup search button
	$('#DialogShareButtonSearch').on('click', (e) => {
		searchUsers();
	});
});
