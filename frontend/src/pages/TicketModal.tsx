import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/modal/Modal';
import { TicketPage } from './TicketPage';

export function TicketModal() {
  const navigate = useNavigate();
  const close = () => navigate(-1);

  return (
    <Modal onClose={close}>
      <TicketPage onClose={close} />
    </Modal>
  );
}
