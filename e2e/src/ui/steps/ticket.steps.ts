import type { BoardPage, TicketPage } from '../pages';
import type { TicketModel } from '../../common/models';

/** High-level ticket flows spanning the board and the ticket form. */
export class TicketSteps {
  constructor(
    private readonly boardPage: BoardPage,
    private readonly ticketPage: TicketPage,
  ) {}

  /**
   * From the board, select the ticket's team, open the new-ticket form, fill
   * it, save, and confirm the resulting card is back on the board.
   */
  async createTicket(ticket: TicketModel): Promise<void> {
    await this.boardPage.open();
    await this.boardPage.selectTeam(ticket.teamName);
    await this.boardPage.startNewTicket();
    await this.ticketPage.fillForm(ticket);
    await this.ticketPage.save();
    await this.boardPage.expectCardVisible(ticket.title);
  }

  /** Open a card as a modal and post a comment on it. */
  async commentOnTicket(ticketTitle: string, comment: string): Promise<void> {
    await this.boardPage.openTicket(ticketTitle);
    await this.ticketPage.expectOpen();
    await this.ticketPage.addComment(comment);
    await this.ticketPage.expectComment(comment);
  }
}
