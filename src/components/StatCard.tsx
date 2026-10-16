import { Paper, Stack, Typography } from '@mui/material'

type StatCardProps = {
  title: string
  value: string
  description: string
}

export function StatCard({
  title,
  value,
  description,
}: StatCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
      <Stack spacing={1}>
        <Typography component="h2" variant="body2" color="text.secondary">
          {title}
        </Typography>

        <Typography
          component="p"
          sx={{
            fontSize: 36,
            fontWeight: 700,
            color: 'primary.main',
          }}
        >
          {value}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Stack>
    </Paper>
  )
}