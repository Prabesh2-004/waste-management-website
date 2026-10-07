import { Box } from "@/components/ui/Box";
import { Row } from "@/components/ui/Row";
import type { UpdateItem } from "@/types";

interface UpdateFeedProps {
  items: UpdateItem[];
  footer: (item: UpdateItem) => string;
}

export function UpdateFeed({ items, footer }: UpdateFeedProps) {
  return (
    <Box>
      {items.map((u) => (
        <Row key={u.id} block>
          <h3 className="m-0">
            {u.c} · {u.d}
          </h3>
          <b>{u.t}</b>
          <div className="text-mut">{u.b}</div>
          <div className="text-[13px] text-mut">{footer(u)}</div>
        </Row>
      ))}
      {items.length === 0 && <p className="text-mut">No updates in this category.</p>}
    </Box>
  );
}
